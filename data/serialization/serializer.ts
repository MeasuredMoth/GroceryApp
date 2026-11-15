// Claude-generated code
import { Dictionary } from "data/types"; // the shared key/value object type

// Base class: every serializer turns a dictionary into some output format and back
export abstract class Serializer<Output> {
    // Convert a dictionary into the output format (e.g. a JSON string)
    public abstract serialize(data: Dictionary<any>): Output;

    // Convert the output format back into a dictionary
    public abstract deserialize(input: Output): Dictionary<any>;
}
// Claude-generated code ends here.
