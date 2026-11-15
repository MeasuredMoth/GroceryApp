// Claude-generated code
import { Dictionary } from "data/types"; // the shared key/value object type
import { Serializer } from "./serializer"; // the base class this one follows

// Converts dictionaries to JSON strings and back
export class JsonSerializer extends Serializer<string> {
    // indent: spaces used to pretty-print the JSON (0 keeps it on one line)
    constructor(private indent: number = 0) {
        super(); // run the base class constructor
    }

    // Turn a dictionary into a JSON string
    public serialize(data: Dictionary<any>): string {
        return JSON.stringify(data, null, this.indent); // null = no custom replacer
    }

    // Turn a JSON string back into a dictionary; throws if it is not a JSON object
    public deserialize(input: string): Dictionary<any> {
        const parsed = JSON.parse(input); // throws a SyntaxError on invalid JSON
        // Reject values that are valid JSON but not an object, like 5, "hi", null or [1, 2]
        if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
            throw new Error("Expected a JSON object"); // tell the caller what went wrong
        }
        return parsed; // the parsed dictionary
    }
}
// Claude-generated code ends here.
