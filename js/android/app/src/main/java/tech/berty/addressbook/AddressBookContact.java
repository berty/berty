package tech.berty.addressbook;

import androidx.annotation.NonNull;

import org.json.JSONException;
import org.json.JSONStringer;

import java.util.ArrayList;
import java.util.List;

class AddressBookContact {
    protected String givenName;
    protected String middleName;
    protected String familyName;
    protected String namePrefix;
    protected String nameSuffix;
    protected List<String> emailAddresses;
    protected List<String> phoneNumbers;

    public AddressBookContact() {
        this.emailAddresses = new ArrayList<>();
        this.phoneNumbers = new ArrayList<>();
    }

    protected static void toJSONStringList(JSONStringer builder, List<String> items) throws JSONException {
        builder.array();

        for (String item : items) {
            builder.value(item);
        }

        builder.endArray();
    }

    public void toJSON(@NonNull JSONStringer builder) throws JSONException {
        builder.object();

        builder.key("givenName").value(this.givenName);
        builder.key("middleName").value(this.middleName);
        builder.key("familyName").value(this.familyName);
        builder.key("namePrefix").value(this.namePrefix);
        builder.key("nameSuffix").value(this.nameSuffix);

        builder.key("emailAddresses");
        toJSONStringList(builder, this.emailAddresses);

        builder.key("phoneNumbers");
        toJSONStringList(builder, this.phoneNumbers);

        builder.endObject();
    }
}
