package doodle;


import org.apache.commons.pool2.PooledObject;
import org.apache.commons.pool2.PooledObjectFactory;
import org.apache.commons.pool2.impl.DefaultPooledObject;
import org.apache.commons.pool2.impl.GenericObjectPool;
import org.apache.commons.pool2.impl.GenericObjectPoolConfig;

import java.util.ArrayList;


class Thing {
    private long id;
    private boolean active = false;
    private boolean destroyed = false;

    public static final long SCALE = 3000000000L;

    public Thing() {
        id = (long)Math.floor(Math.random() * SCALE);

        long tick = id / 100;
        for (long c=0; c<id; c++) {
            if (c%tick==0) {
                System.out.println("\tThread#" + Thread.currentThread().getId() + " INIT " + this + ": " + (100 * c / id) + "%");
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

    public boolean isDestroyed() { return destroyed; }

    public void passivate() {
        if (!destroyed) {
            active = false;
        }
    }

    public void activate() {
        if (!destroyed) {
            active = true;
        }
    }

    public void destroy() {
        destroyed = true;
    }

    public void run(long target) {
        try {
            System.out.println("Starting " + this + "   --->   " + target);

            long tick = target / 100;
            for (long c = 0; c < target; c++) {
                if (c % tick == 0) {
                    System.out.println("Running " + this + ": " + (100 * c / target) + "%");
                }
            }
            System.out.println("Done: " + this);

            if (Math.random() * 10f < 1f) {
                throw new RuntimeException("SUICIIIIDE");
            }

        } catch (Exception e) {
            System.out.println("\tKilling " + this + " because: " + e.getMessage());
            destroy();
        }
    }
}




class ThingFactory implements PooledObjectFactory<Thing> {
    @Override
    public PooledObject<Thing> makeObject() throws Exception {

        System.out.println("##### We're gonna need a nother thing...");
        Thing t = new Thing();
        return new DefaultPooledObject<>(t);
    }

    @Override
    public void destroyObject(PooledObject<Thing> p) throws Exception {
        Thing t = p.getObject();
        System.out.println("\tDestroy: " + t);
        t.destroy();
    }

    @Override
    public boolean validateObject(PooledObject<Thing> p) {
        Thing t = p.getObject();
        System.out.println("\tValidate: " + t);
        return !t.isDestroyed();
    }

    @Override
    public void activateObject(PooledObject<Thing> p) throws Exception {
        Thing t = p.getObject();
        System.out.println("\tActivate: " + t);
        t.activate();
    }

    @Override
    public void passivateObject(PooledObject<Thing> p) throws Exception {
        Thing t = p.getObject();
        System.out.println("\tPassivate: " + t);
        t.passivate();
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

        System.out.println("----------- HEY HO LETS GO -------------");

        ArrayList<Long> tasks = new ArrayList<>();
        for (int i=0; i<500; i++) {
            tasks.add((long)(Math.pow(Math.random() * Math.random() * Math.random(), 4) * Thing.SCALE));
        }

        for (Long task : tasks) {
            try {
                Thing thing = pool.borrowObject();
                thing.run(task);
                pool.returnObject(thing);
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        System.out.println("----------- OKEY-O.");
    }
}
