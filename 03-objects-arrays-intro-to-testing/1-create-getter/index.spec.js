import { createGetter } from "./index.js";

describe("objects-arrays-intro-to-testing/create-getter", () => {
  it("should return existed properties", () => {
    const obj = {
      category: {
        title: "Goods",
        foo: undefined,
      },
    };
    const getter = createGetter("category.title");

    expect(getter(obj)).toEqual("Goods");
  });

  it('should return "undefined" for properties which does not exist', () => {
    const obj = {
      category: {
        title: "Goods",
        foo: undefined,
      },
    };
    const getter1 = createGetter("category.foo");
    const getter2 = createGetter("category.bar");

    expect(getter1(obj)).toBeUndefined();
    expect(getter2(obj)).toBeUndefined();
  });

  it("gets obj.property", () => {
    const getter = createGetter("property");

    expect(getter({ property: 1 })).toEqual(1);
  });

  it("returns undefined for no property", () => {
    const getter = createGetter("property");

    expect(getter({})).toBeUndefined();
  });

  it("returns null for null property", () => {
    const getter = createGetter("property");

    expect(getter({ property: null })).toBeNull();
  });

  it("gets obj.nested.property", () => {
    const getter = createGetter("nested.property");

    expect(getter({ nested: { property: 1 } })).toEqual(1);
  });

  it("returns undefined for no nested.property", () => {
    const getter = createGetter("nested.property");

    expect(getter({})).toBeUndefined();
  });

  it("gets more.nested.property", () => {
    const getter = createGetter("more.nested.property");

    expect(getter({ more: { nested: { property: 1 } } })).toEqual(1);
  });

  it("could be called several times (has not side effects)", () => {
    const getter = createGetter("more.nested.property");

    expect(getter({ more: { nested: { property: 1 } } })).toEqual(1);
    expect(getter({ more: { nested: { property: 1 } } })).toEqual(1);
  });

  it("should not return not own property", () => {
    const getter = createGetter("toString");

    expect(getter({})).toBeUndefined();
  });
  it("should return {object} if property of Object object", () => {
    const getter = createGetter("more.nested.property.person");

    expect(
      getter({
        more: { nested: { property: { person: { age: 55 } } } },
      })
    ).toEqual({ age: 55 });
  });
  it("should return [array] if property of Object array", () => {
    const getter = createGetter("more.nested.property.array");

    expect(
      getter({
        more: { nested: { property: { array: [1, 2, 3] } } },
      })
    ).toEqual([1, 2, 3]);
  });
});
