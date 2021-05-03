package doodle;


import org.apache.commons.pool2.PooledObject;
import org.apache.commons.pool2.PooledObjectFactory;
import org.apache.commons.pool2.impl.DefaultPooledObject;
import org.apache.commons.pool2.impl.GenericObjectPool;
import org.apache.commons.pool2.impl.GenericObjectPoolConfig;

import java.util.concurrent.ConcurrentLinkedQueue;


class Thing {
    private long id;
    private boolean active = false;
    private boolean destroyed = false;

    public static final long SCALE = 30000000L;

    public Thing() {
        id = (long)Math.floor(Math.random() * SCALE);

        long tick = id / 10;
        for (long c=0; c<id; c++) {
            if (c%tick==0) {
                System.out.println("\tINIT " + this + ": " + (100 * c / id) + "%");
            }
        }
    }

    public String toString() {
        return (
                destroyed
                    ? "Dead#"
                    : active
                        ? "Active#"
                        : "Toddler#"
        ) + id;
    }

    public boolean isDestroyed() {
        System.out.println("\tValidating: " + this);
        return destroyed;
    }

    public void passivate() {
        if (!destroyed) {
            System.out.println("\tPassivating???  " + this);
            active = false;
        }
    }

    public void activate() {
        if (!destroyed) {
            System.out.println("\tActivating: " + this);
            active = true;
        }
    }

    public void destroy() {
        System.out.println("\tDestroying: " + this);
        destroyed = true;
    }

    public void run(int threadId, long target) {
        try {
            System.out.println("\tt" + threadId + " - starting " + this + "   --->   " + target);

            long tick = target / 10;
            for (long c = 0; c < target; c++) {
                if (c % tick == 0) {
                    System.out.println("\tt" + threadId + " - running " + this + ": " + (100 * c / target) + "%");
                }
            }
            System.out.println("\tt" + threadId + " - done: " + this);

            if (Math.random() * 10f < 1f) {
                throw new RuntimeException("SUICIIIIDE");
            }

        } catch (Exception e) {
            System.out.println("\tt" + threadId + " - killing " + this + " because: " + e.getMessage());
            destroy();
        }
    }
}




class ThingFactory implements PooledObjectFactory<Thing> {
    @Override
    public PooledObject<Thing> makeObject() throws Exception {

        System.out.println("##### We're gonna need a nother thing...");
        return new DefaultPooledObject<>(new Thing());
    }

    @Override
    public void destroyObject(PooledObject<Thing> p) throws Exception {
        p.getObject().destroy();
    }

    @Override
    public boolean validateObject(PooledObject<Thing> p) {
        return !p.getObject().isDestroyed();
    }

    @Override
    public void activateObject(PooledObject<Thing> p) throws Exception {
        p.getObject().activate();
    }

    @Override
    public void passivateObject(PooledObject<Thing> p) throws Exception {
        p.getObject().passivate();
    }
}


class Worker extends Thread {
    private ConcurrentLinkedQueue<Long> tasks;
    private GenericObjectPool<Thing> pool;
    private int id;
    public Worker(int id, ConcurrentLinkedQueue<Long> tasks, GenericObjectPool<Thing> pool) {
        this.id = id;
        this.tasks = tasks;
        this.pool = pool;
        start();
    }

    @Override
    public void run() {
        while (tasks.size() > 0) {
            Long task = tasks.poll();
            System.out.println(tasks.size());
            if (task != null) {
                Thing thing = null;
                try {
                    thing = pool.borrowObject();
                    thing.run(id, task);
                    pool.returnObject(thing);

                } catch (Exception e) {
                    e.printStackTrace();
                    if (thing!=null) {
                        thing.destroy();
                    }
                }
            } else {
                System.out.println("\n\n\n### t" + id + " - that task was null. Looks like we're done here.");
                return;
            }
        }

        System.out.println("\n\n\n### t" + id + " - we're done here.");
    }
}

/**
 * Created on 03/05/2021 as part of
 */
public class PoolTest {
    public PoolTest() {}

    public static void main(String[] arg) {
        System.out.println("Heyo mundo");

        int coreCount = Runtime.getRuntime().availableProcessors();

        GenericObjectPoolConfig<Thing> poolConfig = new GenericObjectPoolConfig<>();
        poolConfig.setLifo(false);
        poolConfig.setMaxWaitMillis(20000);
        poolConfig.setTestOnBorrow(false);
        poolConfig.setTestOnReturn(true);

        poolConfig.setMaxIdle(coreCount * 2);
        poolConfig.setMaxTotal(coreCount * 4);
        poolConfig.setMinIdle(3);

        GenericObjectPool<Thing> pool = new GenericObjectPool(new ThingFactory(), poolConfig);

        System.out.println("...");

        ConcurrentLinkedQueue<Long> tasks = new ConcurrentLinkedQueue<>();
        for (int i=0; i<500; i++) {
            tasks.offer((long)(Math.pow(Math.random() * Math.random() * Math.random(), 4) * Thing.SCALE));
        }

        System.out.println("----------- HEY HO LETS GO -------------");

        for (int i=0; i<coreCount; i++) {
            new Worker(i, tasks, pool);
        }
    }
}
