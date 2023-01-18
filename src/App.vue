<script setup lang="ts">
import { onMounted } from "vue";
import DeviceInfo from "./components/DeviceInfo";
import EmptyState from "./components/EmptyState";
import Aside from "./components/Aside";
import { useStore } from "./store/main";

const store = useStore();

onMounted(async () => {
  await store.tuyaClient.connect();
  store.loadingDevices = true;
  const response = await store.tuyaClient.get({
    path: "/v1.3/iot-03/devices",
    query: {
      source_type: "tuyaUser",
      source_id: store.tuyaClient.tuyaUserId,
    },
  });
  store.devices = response.list;
  store.loadingDevices = false;
});
</script>

<template>
  <Aside />
  <EmptyState v-if="store.selectedDevice == null" />
  <DeviceInfo v-else />
</template>
