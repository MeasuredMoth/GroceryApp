// Claude-generated code
import { JsonSerializer } from "data/serialization/json-serializer"; // the class under test
import { Serializer } from "data/serialization/serializer"; // its base class
import { Ingredient } from "data/recipe/ingredient"; // a real model to serialize

test("JsonSerializer inherits from Serializer", () => {
    const serializer = new JsonSerializer(); // make a serializer with default settings
    expect(serializer).toBeInstanceOf(Serializer); // it should count as a Serializer
})

test("Serializing a dictionary gives a JSON string", () => {
    const serializer = new JsonSerializer(); // no indentation
    const json = serializer.serialize({ name: "Flour", amount: 2 }); // convert to text
    expect(json).toBe('{"name":"Flour","amount":2}'); // matches JSON.stringify output
})

test("Indent option pretty-prints the JSON", () => {
    const serializer = new JsonSerializer(2); // indent with 2 spaces
    const json = serializer.serialize({ a: 1 }); // convert to text
    expect(json).toBe('{\n  "a": 1\n}'); // each key on its own indented line
})

test("Deserializing gives back the original dictionary", () => {
    const serializer = new JsonSerializer(); // default settings
    const data = { name: "Flour", tags: ["dry"], nested: { amount: 2 } }; // sample data
    const result = serializer.deserialize(serializer.serialize(data)); // round trip
    expect(result).toStrictEqual(data); // nothing lost or changed
})

test("Serializing an Ingredient's data matches its getJSON()", () => {
    const ingredient = new Ingredient("Flour"); // a real model object
    const serializer = new JsonSerializer(); // default settings
    expect(serializer.serialize(ingredient.getData())).toBe(ingredient.getJSON()); // same output as today
})

test("Deserializing invalid or non-object JSON throws", () => {
    const serializer = new JsonSerializer(); // default settings
    expect(() => serializer.deserialize("not json")).toThrow(); // broken text
    expect(() => serializer.deserialize("5")).toThrow("Expected a JSON object"); // a number
    expect(() => serializer.deserialize("null")).toThrow("Expected a JSON object"); // null
    expect(() => serializer.deserialize("[1, 2]")).toThrow("Expected a JSON object"); // an array
})
// Claude-generated code ends here.
