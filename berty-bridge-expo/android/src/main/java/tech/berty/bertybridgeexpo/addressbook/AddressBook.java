package tech.berty.bertybridgeexpo.addressbook;

import android.content.ContentResolver;
import android.content.Context;
import android.database.Cursor;
import android.os.Build;
import android.provider.ContactsContract;
import android.provider.ContactsContract.CommonDataKinds.StructuredName;
import android.provider.ContactsContract.Contacts;
import android.provider.ContactsContract.CommonDataKinds.Email;
import android.provider.ContactsContract.CommonDataKinds.Phone;
import expo.modules.kotlin.Promise;
import expo.modules.kotlin.exception.CodedException;

import org.json.JSONStringer;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;


public class AddressBook {
    private final Context context;

    public AddressBook(Context context) {
        this.context = context;
    }

    private String getCursorValue(Cursor cursor, String currentValue, String columnName) {
        if (currentValue != null && !currentValue.equals("")) {
            return currentValue;
        }

        final int i = cursor.getColumnIndex(columnName);
        if (i < 0) {
            return "";
        }

        return cursor.getString(i);
    }

    private String getCursorValue(Cursor cursor, String columnName) {
        return getCursorValue(cursor, null, columnName);
    }

    private AddressBookContact getContactInformation(ContentResolver cr, String id) {
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

    private List<AddressBookContact> getAllContacts(Context context) {
        ArrayList<AddressBookContact> contacts = new ArrayList<>();
        ContentResolver cr = context.getContentResolver();

        Cursor cur = cr.query(Contacts.CONTENT_URI, null, null, null, null);

        if ((cur != null ? cur.getCount() : 0) > 0) {
            while (cur.moveToNext()) {
                String id = getCursorValue(cur, Contacts._ID);
                AddressBookContact contact = getContactInformation(cr, id);
                contact.fullName = getCursorValue(cur, Contacts.DISPLAY_NAME);

                contacts.add(contact);
            }
        }
        if (cur != null) {
            cur.close();
        }

        return contacts;
    }

    public void getAllContacts(Promise promise) {
        try {
            List<AddressBookContact> contacts = this.getAllContacts(context);

            JSONStringer jsonBuilder = new JSONStringer();
            jsonBuilder.array();

            for (AddressBookContact contact : contacts) {
                contact.toJSON(jsonBuilder);
            }

            jsonBuilder.endArray();

            promise.resolve(jsonBuilder.toString());
        } catch (Exception e) {
            promise.reject(new CodedException("unable to fetch contacts", e));
        }
    }

    public void getDeviceCountry(Promise promise) {
        Locale userLocale = null;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            userLocale = context.getResources().getConfiguration().getLocales().get(0);
        } else {
            userLocale = context.getResources().getConfiguration().locale;
        }

        promise.resolve(userLocale.getCountry());
    }
}
