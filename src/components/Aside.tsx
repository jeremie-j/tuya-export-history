import { defineComponent, computed, ref, onMounted } from "vue";
import DeviceRow from "./DeviceRow";
import { useStore } from "@/store/main";
import Icon from "./Icon";

import "./Icon.css";
import "./Aside.css";

export default defineComponent({
  name: "Aside",
  setup() {
    const store = useStore();

    const search = ref("");
    const filteredDevices = computed(() => {
      return store.devices.filter((device) => {
        return device.name.toLowerCase().includes(search.value.toLowerCase());
      });
    });

    return () => (
      <aside class="aside">
        <div class="header">
          <div class="search-button">
            <Icon name="magnifyingglass" size={15} />
            <input
              type="text"
              class="sub-text"
              placeholder="Search"
              value={search.value}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                search.value = target.value;
              }}
            />
          </div>
          <span class="sub-text">Devices - {filteredDevices.value.length}</span>
        </div>
        <ul>
          {filteredDevices.value.map((device, index) => (
            <DeviceRow
              device={device}
              class={{ active: index == store.selectedDevice }}
              onClick={() => {
                store.selectedDevice = index;
              }}
            />
          ))}
        </ul>
      </aside>
    );
  },
});
