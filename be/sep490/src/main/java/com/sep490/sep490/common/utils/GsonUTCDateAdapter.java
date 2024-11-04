package com.sep490.sep490.common.utils;

import com.google.gson.*;

import java.lang.reflect.Type;
import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.TimeZone;

public class GsonUTCDateAdapter implements JsonSerializer<Date>, JsonDeserializer<Date> {
    private final DateFormat dateFormat1;
    private final DateFormat dateFormat2;

    public GsonUTCDateAdapter() {
        dateFormat1 = new SimpleDateFormat(DateTimeUtils.FORMAT_DATE_TIME5);
        dateFormat1.setTimeZone(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));

        dateFormat2 = new SimpleDateFormat(DateTimeUtils.FORMAT_DATE5);
        dateFormat2.setTimeZone(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
    }

    @Override
    public synchronized JsonElement serialize(Date date, Type type, JsonSerializationContext jsonSerializationContext) {
        try {
            return new JsonPrimitive(dateFormat1.format(date));
        } catch (Exception e) {
            return new JsonPrimitive(dateFormat2.format(date));
        }
    }

    @Override
    public synchronized Date deserialize(JsonElement jsonElement, Type type, JsonDeserializationContext
            jsonDeserializationContext) {
        try {
            return dateFormat1.parse(jsonElement.getAsString());
        } catch (ParseException e) {
            try {
                return dateFormat2.parse(jsonElement.getAsString());
            } catch (ParseException e1) {
                throw new JsonParseException(e1);
            }
        }
    }
}
