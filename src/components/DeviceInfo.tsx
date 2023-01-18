import { defineComponent, computed, ref, watch, onMounted } from "vue";
import { writeTextFile, BaseDirectory } from "@tauri-apps/api/fs";

import { useStore } from "@/store/main";
import EmptyState from "./EmptyState";

import "./DeviceInfo.css";

interface EditedForm {
  statCode: null | string;
  statType: null | string;
  start_date: null | string;
  end_date: null | string;
  granularity: null | string;
}

export default defineComponent({
  name: "DeviceInfo",
  setup() {
    const store = useStore();

    const device = computed(() => {
      return store.devices[store.selectedDevice as number];
    });

    const loading = ref(false);
    const codes = ref<Array<any>>([]);
    const editedForm = ref<EditedForm>({
      statCode: null,
      statType: null,
      start_date: null,
      end_date: null,
      granularity: "days",
    });

    const getDeviceCodes = async () => {
      editedForm.value.statCode = null;
      codes.value = [];
      loading.value = true;
      try {
        await store.tuyaClient
          .get({
            path: `/v1.0/devices/${device.value.id}/all-statistic-type`,
          })
          .then((res) => {
            codes.value = res;
            editedForm.value.statCode = codes.value[0].code;
            editedForm.value.statType = codes.value[0].stat_type;
          });
      } catch (e) {}
      loading.value = false;
    };

    watch(device, () => {
      getDeviceCodes();
    });
    onMounted(() => {
      getDeviceCodes();
    });

    const exportData = async () => {
      if (editedForm.value.statCode == null) {
        return;
      }
      const param = getDateParams() as any;
      let values: any[] = [];
      let last_value = null;
      let requestCount = 0;
      const endate =
        param["end_hour"] || param["end_day"] || param["end_month"];
      while (
        (last_value == null || last_value[0] < endate) &&
        requestCount < 10
      ) {
        if (last_value != null) {
          console.log(last_value[0] < endate, last_value[0], endate);
          param["start_hour"] = last_value[0];
          param["start_day"] = last_value[0];
          param["start_month"] = last_value[0];
        }
        const result = await store.tuyaClient.get({
          path: `/v1.0/devices/${device.value.id}/statistics/${editedForm.value.granularity}`,
          query: {
            code: editedForm.value.statCode,
            stat_type: editedForm.value.statType,
            ...param,
          },
        });
        values = values.concat(
          Object.entries(result[editedForm.value.granularity as string])
        );
        last_value = values[values.length - 1];
        requestCount += 1;
      }
      const data = values.map((value) => value.join(",")).join("\n");
      // Write a text file to the `$APPCONFIG/app.conf` path
      await writeTextFile(`${device.value.name}_export.csv`, data, {
        dir: BaseDirectory.Download,
      });
      const file = new Blob([data], { type: "text/csv" });
      const a = document.createElement("a");
      const url = URL.createObjectURL(file);
      a.href;
    };

    const getDateParams = () => {
      const start_date = new Date(editedForm.value.start_date as string);
      const end_date = new Date(editedForm.value.end_date as string);
      const splittedStartDate = start_date.toISOString().split(/-|T|:/);
      const splittedEndDate = end_date.toISOString().split(/-|T|:/);

      switch (editedForm.value.granularity) {
        case "hours":
          return {
            start_hour: `${splittedStartDate[0]}${splittedStartDate[1]}${splittedStartDate[2]}${splittedStartDate[3]}`,
            end_hour: `${splittedEndDate[0]}${splittedEndDate[1]}${splittedEndDate[2]}${splittedEndDate[3]}`,
          };
        case "days":
          return {
            start_day: `${splittedStartDate[0]}${splittedStartDate[1]}${splittedStartDate[2]}`,
            end_day: `${splittedEndDate[0]}${splittedEndDate[1]}${splittedEndDate[2]}`,
          };
        case "months":
          return {
            start_month: `${splittedStartDate[0]}${splittedStartDate[1]}`,
            end_month: `${splittedEndDate[0]}${splittedEndDate[1]}`,
          };
      }
    };

    return () => {
      if (loading.value) {
        return <EmptyState text="Loading..." iconName="ellipsis.rectangle" />;
      } else if (codes.value.length == 0) {
        return (
          <EmptyState
            text="This device has no data to export"
            iconName="ellipsis.rectangle"
          />
        );
      } else {
        return (
          <div class="device-info-container">
            <h1 class="header">{device.value.name}</h1>
            {/* <h2>Available codes</h2>
            <table class="code-table text">
              <tr>
                <td>Code Name</td>
                <td>Stat Type</td>
              </tr>
              {codes.value.map((code: any) => (
                <tr>
                  <td>{code.code}</td>
                  <td>{code.stat_type}</td>
                </tr>
              ))}
            </table> */}
            <h2>Export</h2>
            <div class="export-selector">
              <p class="sub-text">Code</p>
              <select
                name="code"
                id="code"
                value={editedForm.value.statCode}
                onChange={(e: any) => {
                  const code = codes.value.find(
                    (c) => c.code == e.target.value
                  );
                  editedForm.value.statCode = code.code;
                  editedForm.value.statType = code.stat_type;
                }}
              >
                {codes.value.map((code: any) => (
                  <option value={code.code}>{code.code}</option>
                ))}
              </select>
            </div>
            {/* <div class="export-selector">
              <p class="sub-text">Stat Type</p>
              <select
                name="stat_type"
                id="stat_type"
                value={editedForm.value.statCode}
                onChange={(e: any) =>
                  (editedForm.value.statCode = e.target.value)
                }
              >
                {codes.value.map((code: any) => (
                  <option value={code.stat_type}>{code.stat_type}</option>
                ))}
              </select>
            </div> */}
            <div class="export-selector">
              <p class="sub-text">From</p>
              <input
                type="date"
                value={editedForm.value.start_date}
                onChange={(e: any) =>
                  (editedForm.value.start_date = e.target.value)
                }
              />
            </div>
            <div class="export-selector">
              <p class="sub-text">To</p>
              <input
                type="date"
                value={editedForm.value.end_date}
                onChange={(e: any) =>
                  (editedForm.value.end_date = e.target.value)
                }
              />
            </div>
            <div class="export-selector">
              <p class="sub-text">Granularity</p>
              <select
                name="granularity"
                id="granularity"
                value={editedForm.value.granularity}
                onChange={(e: any) =>
                  (editedForm.value.granularity = e.target.value)
                }
              >
                {/* <option value="hours">Hours</option> */}
                <option value="days">Days</option>
                <option value="month">Month</option>
              </select>
            </div>
            <input
              type="button"
              value="Export"
              onClick={exportData}
              disabled={editedForm.value.statCode == null}
            />
          </div>
        );
      }
    };
  },
});
