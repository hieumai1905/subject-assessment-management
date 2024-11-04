package com.sep490.sep490.common.utils;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.TimeZone;

public class DateTimeUtils {
    public static final String ISO_8601_FORMAT = "yyyy-MM-dd HH:mm:ss";
    public static final String ISO_8601_FORMAT_DATE = "yyyy-MM-dd";
    public static final String FORMAT_yyyy_mm_dd = "yyyy/MM/dd";
    public static final String FORMAT_mm_dd_yyyy = "MM/dd/yyyy";
    public static final String FORMAT_dd_MM_yyyy = "dd/MM/yyyy";
    public static final String FORMAT_dd_MM_yyyy_hh_mm_ss_mmm = "dd/MM/yyyy hh:mm:ss";
    public static final String FORMAT_TIME = "HH:MM:SS";
    public static final String FORMAT_TIME_Hms = "HH:mm:ss";
    public static final String FORMAT_TIME_Hm = "HH:mm";
    public static final String FORMAT_DATE2 = "dd/MM/yyyy";
    public static final String FORMAT_DATE5 = "yyyy-MM-dd";
    public static final String FORMAT_DATE_TIME2 = "dd/MM/yyy hh:mm:ss";
    public static final String FORMAT_DATE_TIME3 = "dd/MM/yyyy HH:mm:ss";
    public static final String FORMAT_DATE_TIME5 = "yyyy-MM-dd HH:mm:ss";
    public static final String FORMAT_DB_TIME = "HH24:MI:SS";
    public static final String FORMAT_DB_DATE = "yyyy-MM-dd";
    public static final String FORMAT_DB_DATE_TIME = "YYYY-MM-DD HH24:MI:SS";
    public static final String FORMAT_DB_YDATE_TIME = "SYYYY-MM-DD HH24:MI:SS";
    public static final String FORMAT_YMDHMS = "yyyyMMddhh24muss";
    public static final String FORMAT_YMD = "yyyyMMdd";
    public static final String FORMAT_MONTH = "yyyy-MM";
    public static final String GMT0 = "GMT+00:00";
    public static final String GMT7 = "GMT+07:00";
    private static final String FORMAT_DATE = "DD/MM/YYYY";
    public static final SimpleDateFormat FM_DATE = new SimpleDateFormat(FORMAT_DATE);
    private static final String FORMAT_DATE_TIME = "DD/MM/YYYY HH:MM:SS";
    public static final SimpleDateFormat FM_DATE_TIME = new SimpleDateFormat(FORMAT_DATE_TIME);
    private static final String FORMAT_DATE_TIME4 = "dd/MM/yyyy HH:mm";
    public static TimeZone TIMEZONE_VN = TimeZone.getTimeZone("GMT+07:00");
    public static TimeZone TIMEZONE_DEFAULT = TIMEZONE_VN;
    private static SimpleDateFormat formatter = new SimpleDateFormat();

    /**
     * Convert date to string with a pattern Example mm/dd/yyyy
     *
     * @param date
     * @param format
     * @return
     */
    public static String dateToString(Date date, String format) {
        return dateToString(date, format, TIMEZONE_DEFAULT);
    }

    public static String dateToString(Date date, String format, TimeZone timeZone) {
        if (date == null)
            return null;
        formatter.setTimeZone(timeZone);
        formatter.applyPattern(format);
        return formatter.format(date);
    }


    /**
     * Convert String to Date object
     *
     * @param dateStr
     * @param format
     * @return
     * @throws ParseException
     */
    public static Date stringToDate(String dateStr, String format) throws ParseException {
        return stringToDate(dateStr, format, TIMEZONE_DEFAULT);
    }


    public static Date stringToDate(String dateStr, String format, TimeZone timeZone) throws ParseException {
        if (dateStr == null)
            return null;
        formatter.setTimeZone(timeZone);
        formatter.applyPattern(format);
        return formatter.parse(dateStr.trim());
    }

    public static Date formatFromTime(Date fromTime) {
        Calendar fromDate = Calendar.getInstance(TIMEZONE_DEFAULT);
        fromDate.setTime(fromTime);
        fromDate.set(Calendar.MINUTE, 00);
        fromDate.set(Calendar.SECOND, 01);
        // fromTime trước 12h tính luôn là 0 giờ
        // fromTime sau 12h tính luôn là 12 giờ
        if (fromDate.get(Calendar.HOUR_OF_DAY) < 12)
            fromDate.set(Calendar.HOUR_OF_DAY, 0);
        else
            fromDate.set(Calendar.HOUR_OF_DAY, 12);


        return fromDate.getTime();
    }

    public static Date formatToTime(Date toTime) {
        Calendar toDate = Calendar.getInstance(TIMEZONE_DEFAULT);
        toDate.setTime(toTime);
        toDate.set(Calendar.MINUTE, 59);
        toDate.set(Calendar.SECOND, 59);
        // toTime trước 12h tinh luôn là 11h
        // toTime sau 12h tinh luôn là 23h
        if (toDate.get(Calendar.HOUR_OF_DAY) < 12)
            toDate.set(Calendar.HOUR_OF_DAY, 11);
        else
            toDate.set(Calendar.HOUR_OF_DAY, 23);

        return toDate.getTime();
    }

    public static String addMinute(String hhMM, int min) {
        String[] times = hhMM.split(":");
        Calendar calendar = Calendar.getInstance(TIMEZONE_DEFAULT);
        calendar.set(Calendar.HOUR_OF_DAY, Integer.valueOf(times[0]));
        calendar.set(Calendar.MINUTE, Integer.valueOf(times[1]));
        calendar.set(Calendar.SECOND, 0);
        calendar.set(Calendar.MILLISECOND, 0);

        calendar.add(Calendar.MINUTE, min);
        return String.format("%02d:%02d", calendar.get(Calendar.HOUR_OF_DAY), calendar.get(Calendar.MINUTE));
    }

    public static Date getCurrentTime() {
        Calendar calendar = Calendar.getInstance(DateTimeUtils.TIMEZONE_DEFAULT);
        calendar.setTime(new Date());
        return calendar.getTime();
    }

    public static boolean compairDate(String date1, String date2) throws ParseException {
        Date d1 = stringToDate(date1, FORMAT_DATE5);
        Date d2 = stringToDate(date2, FORMAT_DATE5);

        if (d1.getTime() <= d2.getTime())
            return true;
        return false;
    }
}
