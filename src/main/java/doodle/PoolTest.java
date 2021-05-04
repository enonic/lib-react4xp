package doodle;


import org.apache.commons.pool2.PooledObject;
import org.apache.commons.pool2.PooledObjectFactory;
import org.apache.commons.pool2.impl.DefaultPooledObject;
import org.apache.commons.pool2.impl.GenericObjectPool;
import org.apache.commons.pool2.impl.GenericObjectPoolConfig;

import java.util.concurrent.ConcurrentLinkedQueue;


class Engine {
    private int id;
    private boolean active = false;
    private boolean destroyed = false;


    public Engine(int id) throws InterruptedException {
        this.id = id;
        System.out.println("------ We're gonna need a new engine: Init#" + id);

        // Engine init, simulate assets loading
        int initSize = 5 + (int)(Math.random() * 15);
        for (long c = 1; c<= initSize; c++) {
            Thread.sleep(1000);
            System.out.println("\tINIT " + this + ": " + c + " / " + initSize);
        }
    }

    public String toString() {
        return (
                destroyed
                    ? "Dead#"
                    : active
                        ? "Engine#"
                        : "Init#"
        ) + id;
    }

    public boolean isDestroyed() {
        System.out.println("\tValidating: " + this);
        return destroyed;
    }

    public void passivate() {
        if (!destroyed) {
            active = false;
            System.out.println("\tPassivated:  " + this);
        }
    }

    public void activate() {
        if (!destroyed) {
            active = true;
            System.out.println("\tActivated: " + this);
        }
    }

    public void destroy() {
        destroyed = true;
        System.out.println("\tDestroyed: " + this);
    }

    public void render(int threadId, int steps) {
        try {
            System.out.println("\tThread#" + threadId + ", " + this + ": starting (" + steps + " steps)");

            for (int s = 1; s <= steps; s++) {
                Thread.sleep(250);
                System.out.println("\tThread#" + threadId + ", " + this + ": rendering (" + s + " / " + steps + ")");
            }

            // Test failure handling: 10% chance to finish with a random error
            if (Math.random() < .1f) {
                throw new RuntimeException("GOODBYE CRUEL WORLD I FAILED YOU!");
            }

            System.out.println("\tThread#" + threadId + ", " + this + ": done.");

        } catch (Exception e) {
            System.out.println("\tThread#" + threadId + ": destroying " + this + " because: " + e.getMessage());
            destroy();
        }
    }
}




class ThingFactory implements PooledObjectFactory<Engine> {
    @Override
    public PooledObject<Engine> makeObject() throws Exception {
        return new DefaultPooledObject<>(new Engine((int)(Math.random() * 1000)));
    }

    @Override
    public void destroyObject(PooledObject<Engine> p) throws Exception {
        p.getObject().destroy();
    }

    @Override
    public boolean validateObject(PooledObject<Engine> p) {
        return !p.getObject().isDestroyed();
    }

    @Override
    public void activateObject(PooledObject<Engine> p) throws Exception {
        p.getObject().activate();
    }

    @Override
    public void passivateObject(PooledObject<Engine> p) throws Exception {
        p.getObject().passivate();
    }
}


class RenderRequestHandler extends Thread {
    private ConcurrentLinkedQueue<Integer> requestQueue;
    private GenericObjectPool<Engine> enginePool;
    private int threadId;
    private long startTime;
    public RenderRequestHandler(int threadId, ConcurrentLinkedQueue<Integer> requestQueue, GenericObjectPool<Engine> enginePool) {
        this.threadId = threadId;
        this.requestQueue = requestQueue;
        this.enginePool = enginePool;
    }

    public void setStartTime(long startTime) {
        this.startTime = startTime;
    }

    @Override
    public void run() {
        long elapsedTime;
        while (requestQueue.size() > 0) {
            Integer requestWithSteps = requestQueue.poll();
            System.out.println("Got a task (" + requestWithSteps + " steps). Remaining: " + requestQueue.size());

            if (requestWithSteps != null) {
                Engine thing = null;
                try {
                    thing = enginePool.borrowObject();
                    thing.render(threadId, requestWithSteps);
                    enginePool.returnObject(thing);

                } catch (Exception e) {
                    e.printStackTrace();
                    if (thing!=null) {
                        thing.destroy();
                    }
                }

            } else {
                elapsedTime = System.currentTimeMillis() - startTime;
                System.out.println("########### Thread#" + threadId + ": that task was null. Looks like we're done here, tasks.size = " + requestQueue.size());
                System.out.println("########### Thread#" + threadId + ": " + (elapsedTime/1000f) + " s.");
                return;
            }
        }
        elapsedTime = System.currentTimeMillis() - startTime;
        System.out.println("########### Thread#" + threadId + ": no more requests, we're done here.");
        System.out.println("########### Thread#" + threadId + ": " + (elapsedTime/1000f) + " s.");
    }
}

public class PoolTest {
    private static final int THREADCOUNT = Runtime.getRuntime().availableProcessors();
    private static final int REQUESTCOUNT = 50;

    public PoolTest() {}

    public static void main(String[] arg) {

        GenericObjectPoolConfig<Engine> poolConfig = new GenericObjectPoolConfig<>();
        poolConfig.setLifo(true);
        poolConfig.setMaxWaitMillis(20000);
        poolConfig.setTestOnBorrow(false);
        poolConfig.setTestOnReturn(true);

        poolConfig.setMaxIdle(THREADCOUNT * 2);
        poolConfig.setMaxTotal(THREADCOUNT * 4);
        poolConfig.setMinIdle(3);

        System.out.println("Setup with " + THREADCOUNT + " threads...");

        GenericObjectPool<Engine> enginePool = new GenericObjectPool(new ThingFactory(), poolConfig);

        ConcurrentLinkedQueue<Integer> requestQueue = new ConcurrentLinkedQueue<>();
        for (int i=0; i<REQUESTCOUNT; i++) {
            int requestWithSteps = 2 + (int)(Math.random() * Math.random() * Math.random() * 20 * 3f);
            requestQueue.offer(requestWithSteps);
        }

        RenderRequestHandler[] threads = new RenderRequestHandler[THREADCOUNT];
        for (int id=0; id<THREADCOUNT; id++) {
            threads[id] = new RenderRequestHandler(id, requestQueue, enginePool);
        }
        System.out.println("----------- HEY HO LET'S GO -------------");

        long startTime = System.currentTimeMillis();
        for (RenderRequestHandler thread : threads) {
            thread.setStartTime(startTime);
            thread.start();
        }
    }
}
