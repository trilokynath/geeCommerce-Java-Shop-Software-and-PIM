package com.geecommerce.core.service.mongodb.cmd;

import java.util.regex.Pattern;

import com.geecommerce.core.App;
import com.geecommerce.core.Char;
import com.geecommerce.core.Num;
import com.geecommerce.core.Str;
import com.google.inject.Inject;
import com.mongodb.BasicDBObject;
import com.mongodb.DBObject;

public abstract class AbstractCommand implements Command {
    protected App app = App.get();

    protected final String ALIAS_NOT_NULL = "$nn";
    protected final String MONGODB_NOT_EQUALS = "$ne";
    protected static final String REGEX_WC = ".*";

    /**
     * Evaluate some standard commands.
     * 
     * @param value
     * @return
     */
    protected DBObject processValue(String key, Object value) {
        if (value == null)
            return null;

        DBObject dbValue = new BasicDBObject();

        if (value instanceof String) {
            String val = (String) value;

            // Is it a regex-query?
            if (val.indexOf(Str.ASTERIX) > 2) {
                dbValue.put(key, toWildcardPattern(val));
            }
            // Is it a not-null-query?
            else if (ALIAS_NOT_NULL.equals(val)) {
                dbValue.put(MONGODB_NOT_EQUALS, null);
            } else {
                if (Num.isWholeNumber(val)) {
                    if (val.length() > 9) {
                        dbValue.put(key, Long.valueOf(val));
                    } else {
                        dbValue.put(key, Integer.valueOf(val));
                    }
                } else if (Num.isDouble(val)) {
                    dbValue.put(key, Double.valueOf(val));
                } else {
                    dbValue.put(key, val);
                }
            }
        } else {
            dbValue.put(key, value);
        }

        return dbValue;
    }

    protected Pattern toWildcardPattern(String value) {
        StringBuilder pattern = new StringBuilder().append(Char.CARET).append(value.replace(Str.ASTERIX, REGEX_WC));

        // Quick hack for now until better, more generic solution.
        if (app.isAPIRequest())
            return Pattern.compile(pattern.toString(), Pattern.CASE_INSENSITIVE);
        else
            return Pattern.compile(pattern.toString(), Pattern.CASE_INSENSITIVE);
    }
}
