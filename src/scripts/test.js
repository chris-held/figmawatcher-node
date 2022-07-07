import bcrypt from "bcrypt";
import fetch from "node-fetch";
import "dotenv/config";

const figmaKey = process.env.FIGMA_KEY;

// throwaway test file
const file = "cvpDzONjLd38jklADH2FuK";
const node = "6%3A2";

console.log("Querying Figma...");

fetch(`https://api.figma.com/v1/files/${file}/nodes?ids=${node}`, {
  headers: { "X-Figma-Token": figmaKey || "" },
}).then(async (res) => {
  if (res.ok) {
    const body = await res.json();

    // this is the original value of the nodes object. If the figma file
    // were to change this would not match when compared, so we know there was
    // a change made
    const old = `{"6:2":{"document":{"id":"6:2","name":"Group 2","type":"COMPONENT","blendMode":"PASS_THROUGH","children":[{"id":"2:10","name":"Rectangle 2","type":"VECTOR","blendMode":"PASS_THROUGH","absoluteBoundingBox":{"x":-114,"y":-92,"width":185,"height":64},"constraints":{"vertical":"SCALE","horizontal":"SCALE"},"fills":[{"blendMode":"NORMAL","type":"SOLID","color":{"r":0.9607843160629272,"g":0.9607843160629272,"b":0.9607843160629272,"a":1}}],"strokes":[],"strokeWeight":1,"strokeAlign":"INSIDE","effects":[{"type":"DROP_SHADOW","visible":true,"color":{"r":0,"g":0,"b":0,"a":0.25},"blendMode":"NORMAL","offset":{"x":0,"y":4},"radius":4,"showShadowBehindNode":false}]},{"id":"2:13","name":"And me?","type":"TEXT","blendMode":"PASS_THROUGH","absoluteBoundingBox":{"x":-69,"y":-74,"width":99,"height":29},"constraints":{"vertical":"SCALE","horizontal":"SCALE"},"fills":[{"blendMode":"NORMAL","type":"SOLID","color":{"r":0,"g":0,"b":0,"a":1}}],"strokes":[],"strokeWeight":1,"strokeAlign":"OUTSIDE","effects":[],"characters":"And me?","style":{"fontFamily":"Inter","fontPostScriptName":null,"fontWeight":400,"textAutoResize":"WIDTH_AND_HEIGHT","fontSize":24,"textAlignHorizontal":"LEFT","textAlignVertical":"TOP","letterSpacing":0,"lineHeightPx":28.125,"lineHeightPercent":100,"lineHeightUnit":"INTRINSIC_%"},"layoutVersion":3,"characterStyleOverrides":[],"styleOverrideTable":{},"lineTypes":["NONE"],"lineIndentations":[0]}],"absoluteBoundingBox":{"x":-114,"y":-92,"width":185,"height":64},"constraints":{"vertical":"TOP","horizontal":"LEFT"},"clipsContent":false,"background":[],"fills":[],"strokes":[],"strokeWeight":1,"strokeAlign":"INSIDE","backgroundColor":{"r":0,"g":0,"b":0,"a":0},"effects":[]},"components":{"6:2":{"key":"d89cf5645cedbb7e83e32314b87f83eedc0a0a6a","name":"Group 2","description":"","documentationLinks":[]}},"componentSets":{},"schemaVersion":0,"styles":{}}}`;
    const compare = old === JSON.stringify(body.nodes);
    console.log(
      compare ? "Figma node hasn't changed" : "This Figma node changed!"
    );
    if (!compare) {
      console.log("New value:");
      console.log(JSON.stringify(body.nodes));
    }
    process.exit(0);
  }
  console.log(res);
  throw new Error("Fetch failed :(");
});
