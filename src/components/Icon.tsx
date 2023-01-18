import { defineComponent } from "vue";
import icons from "@/assets/icons.json";

import "./Icon.css";

export default defineComponent({
  name: "Icon",
  props: {
    name: { type: String, required: true },
    size: { type: Number, default: 20 },
    color: { type: String, default: "#FFF" },
    weigth: { type: Number, default: 200 },
    loading: { type: Boolean, default: false },
  },
  setup(props) {
    const icon = icons.find((icon) => icon.name == props.name);

    return () => (
      <i
        style={{
          "font-size": `${props.size}px`,
          "font-weight": props.weigth,
          color: props.color,
        }}
        class={{
          loading: props.loading,
        }}
      >
        {icon ? icon.symbol : "Icon not found"}
      </i>
    );
  },
});
