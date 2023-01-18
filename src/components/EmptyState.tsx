import { defineComponent } from "vue";
import "./EmptyState.css";
import Icon from "./Icon";

export default defineComponent({
  name: "EmptyState",
  props: {
    text: {
      type: String,
      default: "Select a device in the list",
    },
    iconName: { type: String, default: "list.bullet.rectangle" },
  },
  setup(props) {
    return () => (
      <div class="empty-state sub-text">
        <div>
          <Icon
            name={props.iconName}
            size={96}
            color={"#959292"}
            loading={true}
          />
        </div>
        <div style={{ "max-width": "300px", "text-align": "center" }}>
          {props.text}
        </div>
      </div>
    );
  },
});
