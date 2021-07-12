package tech.berty.gobridge.nearbydriver.util;


import tech.berty.android.BuildConfig;


/**
 * Berty Logger 2021
 */
public class BertyLogger {

    /**
     * .
     *
     * @param tag    the tag
     * @param string the string
     */
    public static void i(String tag, String string) {
        if (BuildConfig.DEBUG) android.util.Log.i(tag, string);
    }

    /**
     * E.
     *
     * @param tag    the tag
     * @param string the string
     */
    public static void e(String tag, String string) {
        android.util.Log.e(tag, string);
    }


    public static void e(String tag, String string, Throwable throwable) {
        android.util.Log.e(tag, string, throwable);
    }

    /**
     * D.
     *
     * @param tag    the tag
     * @param string the string
     */
    public static void d(String tag, String string) {
        android.util.Log.d(tag, string);
    }

    /**
     * V.
     *
     * @param tag    the tag
     * @param string the string
     */
    public static void v(String tag, String string) {
        if (BuildConfig.DEBUG) android.util.Log.v(tag, string);
    }

    /**
     * W.
     *
     * @param tag    the tag
     * @param string the string
     */
    public static void w(String tag, String string) {
        if (BuildConfig.DEBUG) android.util.Log.w(tag, string);
    }
}


