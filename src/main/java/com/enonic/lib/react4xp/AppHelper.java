package com.enonic.lib.react4xp;

import com.enonic.xp.server.RunMode;
import java.lang.System;

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
