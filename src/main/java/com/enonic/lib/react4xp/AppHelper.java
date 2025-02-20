package com.enonic.lib.react4xp;

import com.enonic.xp.server.RunMode;

public class AppHelper
{
  public boolean isDevMode()
  {
    return RunMode.get() == RunMode.DEV;
  }

  public String getXpHome()
  {
    return System.getProperty("xp.home");
  }
}
