import * as React from "react";
import Svg, {
  Defs,
  RadialGradient,
  Stop,
  G,
  Circle,
  Path,
  Text,
} from "react-native-svg";
const SVGComponent = (props) => (
  <Svg
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    viewBox="0 0 768 256"
    {...props}
  >
    <Defs>
      <RadialGradient id="gradient">
        <Stop offset="00%" stopColor="#F7CA00" />
        <Stop offset="80%" stopColor="#F7C000" />
        <Stop offset="100%" stopColor="#F7A200" />
      </RadialGradient>
    </Defs>
    <G id="Logo">
      <Circle cx={128} cy={128} r={128} fill="#000000" />
      <Circle cx={128} cy={128} r={100} fill="url(#gradient)" />
      <Path
        d="M60,170 L155,170 L142,150 L98,150 L127,102 L170,170 L196,170 L127,55z"
        fill="#000000"
      />
    </G>
    <G id="Text" fill="#FFFFFF">
      <G id="AIMP">
        <Path d="M313,142 L339,142 L381,92 L404,142 L428,142 L398,75 L370,75z M352,125 L396,125 L394,110 L360,110" />
        <Path d="M435,142 L458,142 L472,75 L449,75z" />
        <Path d="M472,142 L495,142 L505,93 L524,142 L553,142 L587,93 L578,142 L601,142 L614,75 L577,74 L539,125 L524,75 L486,75z" />
        <Path d="M612,142 L633,142 L637,122 L675,122 L675,107 L641,107 L645,88 L680,88 L680,75 L626,75z M680,75 L685,75 C710,82 700,116 680,122 L675,122 L675,107 C682,107 686,90 680,88z" />
      </G>
      <Text
        x={680}
        y={180}
        textAnchor="end"
        fontFamily="Tahoma"
        fontSize="32px"
        style={{
          fontStyle: "italic",
        }}
      >
        {"ENJOY THE MUSIC!"}
      </Text>
    </G>
  </Svg>
);
export default SVGComponent;
