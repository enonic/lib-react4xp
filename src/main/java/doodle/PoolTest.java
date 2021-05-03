package doodle;


import org.apache.commons.pool2.PooledObject;
import org.apache.commons.pool2.PooledObjectFactory;
import org.apache.commons.pool2.impl.DefaultPooledObject;
import org.apache.commons.pool2.impl.GenericObjectPool;
import org.apache.commons.pool2.impl.GenericObjectPoolConfig;

import java.util.ArrayList;




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


