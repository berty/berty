package tech.berty.addressbook;

import android.content.ContentResolver;
import android.database.Cursor;
import android.os.Build;
import android.provider.ContactsContract;
import android.provider.ContactsContract.CommonDataKinds.StructuredName;
import android.provider.ContactsContract.Contacts;
import android.provider.ContactsContract.CommonDataKinds.Email;
import android.provider.ContactsContract.CommonDataKinds.Phone;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import org.json.JSONStringer;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;


public class AddressBookModule extends ReactContextBaseJavaModule {
    public AddressBookModule(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    protected String getCursorValue(Cursor cursor, String currentValue, String columnName) {
        if (currentValue != null && !currentValue.equals("")) {
            return currentValue;
        }

        return cursor.getString(cursor.getColumnIndex(columnName));
    }

    protected String getCursorValue(Cursor cursor, String columnName) {
        return getCursorValue(cursor, null, columnName);
    }

    protected AddressBookContact getContactInformation(ContentResolver cr, String id) {
        AddressBookContact contact = new AddressBookContact();

        // Retrieve phone numbers
        Cursor cursor = cr.query(Phone.CONTENT_URI, null, Phone.CONTACT_ID + " = ?", new String[]{id}, null);
        while (cursor.moveToNext()) {
            contact.phoneNumbers.add(getCursorValue(cursor, Phone.NUMBER));
        }
        cursor.close();

        // Retrieve email addresses
        cursor = cr.query(Email.CONTENT_URI, null, Email.CONTACT_ID + " = ?", new String[]{id}, null);
        while (cursor.moveToNext()) {
            contact.emailAddresses.add(getCursorValue(cursor, Email.ADDRESS));
        }
        cursor.close();

        // Retrieve name information
        cursor = cr.query(ContactsContract.Data.CONTENT_URI, null, Phone.CONTACT_ID + " = ? AND " + ContactsContract.Data.MIMETYPE + " = ?", new String[]{id, StructuredName.CONTENT_ITEM_TYPE}, null);
        if (cursor.moveToFirst()) {
            contact.givenName = getCursorValue(cursor, contact.givenName, StructuredName.GIVEN_NAME);
            contact.middleName = getCursorValue(cursor, contact.middleName, StructuredName.MIDDLE_NAME);
            contact.familyName = getCursorValue(cursor, contact.familyName, StructuredName.FAMILY_NAME);
            contact.namePrefix = getCursorValue(cursor, contact.namePrefix, StructuredName.PREFIX);
            contact.nameSuffix = getCursorValue(cursor, contact.nameSuffix, StructuredName.SUFFIX);
        }
        cursor.close();

        return contact;
    }

    protected List<AddressBookContact> getAllContacts() {
        ArrayList<AddressBookContact> contacts = new ArrayList<>();
        ContentResolver cr = getReactApplicationContext().getContentResolver();

        Cursor cur = cr.query(Contacts.CONTENT_URI, null, null, null, null);

        if ((cur != null ? cur.getCount() : 0) > 0) {
            while (cur.moveToNext()) {
                String id = getCursorValue(cur, Contacts._ID);
                AddressBookContact contact = getContactInformation(cr, id);

                contacts.add(contact);
            }
        }
        if (cur != null) {
            cur.close();
        }

        return contacts;
    }

    @ReactMethod
    public void getAllContacts(Promise promise) {
        try {
            List<AddressBookContact> contacts = this.getAllContacts();

            JSONStringer jsonBuilder = new JSONStringer();
            jsonBuilder.array();

            for (AddressBookContact contact : contacts) {
                contact.toJSON(jsonBuilder);
            }

            jsonBuilder.endArray();

            promise.resolve(jsonBuilder.toString());
        } catch (Exception e) {
            promise.reject("unable to fetch contacts", e);
        }
    }

    @ReactMethod
    public void getDeviceCountry(Promise promise) {
        Locale userLocale = null;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            userLocale = getReactApplicationContext().getResources().getConfiguration().getLocales().get(0);
        } else {
            userLocale = getReactApplicationContext().getResources().getConfiguration().locale;
        }

        promise.resolve(userLocale.getCountry());
    }

    @NonNull
    @Override
    public String getName() {
        return "AddressBook";
    }
}
