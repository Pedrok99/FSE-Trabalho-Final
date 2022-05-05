#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "nvs_flash.h"
#include "wifi.h"
#include "freertos/semphr.h"
#include "esp_log.h"
#include "esp_system.h"
#include "mqtt.h"
#include "sensor.h"
#include "button.h"

#define TAG "MAIN"

xSemaphoreHandle wifi_semaphore;
xSemaphoreHandle conexaoMQTTSemaphore;

void onWifiConnected(void *params)
{
    while (true)
    {
        if (xSemaphoreTake(wifi_semaphore, portMAX_DELAY))
        {
            ESP_LOGI(TAG, "Conectado ao wifi");

            mqtt_start();

            ESP_LOGI(TAG, "Conecção com o broker mqtt feita");
        }

        vTaskDelay(2000 / portTICK_PERIOD_MS);
    }
}

void app_main()
{
    // init NVS
    esp_err_t ret = nvs_flash_init();
    if (ret == ESP_ERR_NVS_NO_FREE_PAGES || ret == ESP_ERR_NVS_NEW_VERSION_FOUND)
    {
        ESP_ERROR_CHECK(nvs_flash_erase());
        ret = nvs_flash_init();
    }
    ESP_ERROR_CHECK(ret);
    conexaoMQTTSemaphore = xSemaphoreCreateBinary();
    wifi_semaphore = xSemaphoreCreateBinary();

    wifi_start();

    xTaskCreate(&onWifiConnected, "onWifiConnected", 4096, NULL, 1, NULL);
    xTaskCreate(&get_sensor_data, "get_sensor_data", 4096, NULL, 1, NULL);
    xTaskCreate(&config_button, "config_button", 4096, NULL, 1, NULL);
}
