import { describe, it, expect } from "vitest";
import { cn } from "../utils";

describe("utils", () => {
  describe("cn", () => {
    it("should merge class names correctly", () => {
      const result = cn("text-red-500", "bg-blue-500");
      expect(result).toBe("text-red-500 bg-blue-500");
    });

    it("should handle conditional classes", () => {
      const result = cn("text-red-500", true && "bg-blue-500", false && "hidden");
      expect(result).toBe("text-red-500 bg-blue-500");
    });

    it("should handle arrays of classes", () => {
      const result = cn(["text-red-500", "bg-blue-500"]);
      expect(result).toBe("text-red-500 bg-blue-500");
    });

    it("should handle objects with boolean values", () => {
      const result = cn({
        "text-red-500": true,
        "bg-blue-500": false,
        "font-bold": true,
      });
      expect(result).toBe("text-red-500 font-bold");
    });

    it("should merge tailwind classes using tailwind-merge", () => {
      // tailwind-merge should resolve conflicts (e.g., p-4 overrides p-2)
      const result = cn("p-2", "p-4");
      expect(result).toBe("p-4");
    });

    it("should handle complex combinations", () => {
      const result = cn(
        "text-base",
        {
          "text-lg": false,
          "text-xl": true,
        },
        ["font-bold", "uppercase"]
      );
      expect(result).toBe("text-xl font-bold uppercase");
    });
  });
});
