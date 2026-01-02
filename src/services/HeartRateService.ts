/// <reference types="web-bluetooth" />

export interface HeartRateData {
    heartRate: number;
    contactDetected: boolean;
    rrIntervals?: number[];
    energyExpended?: number;
    batteryLevel?: number;
}

export class HeartRateService {
    private device: BluetoothDevice | null = null;
    private server: BluetoothRemoteGATTServer | null = null;
    private heartRateCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;
    private batteryCharacteristic: BluetoothRemoteGATTCharacteristic | null = null;
    private onDataCallback: ((data: HeartRateData) => void) | null = null;
    private onStatusCallback: ((status: string) => void) | null = null;

    // Standard Bluetooth SIG UUIDs
    private static HEART_RATE_SERVICE = 'heart_rate';
    private static HEART_RATE_MEASUREMENT = 'heart_rate_measurement';
    private static BATTERY_SERVICE = 'battery_service';
    private static BATTERY_LEVEL = 'battery_level';

    constructor() { }

    async connect(onData: (data: HeartRateData) => void, onStatus: (status: string) => void) {
        this.onDataCallback = onData;
        this.onStatusCallback = onStatus;

        try {
            this.updateStatus('Requesting Heart Rate Monitor...');
            this.device = await navigator.bluetooth.requestDevice({
                filters: [{ services: [HeartRateService.HEART_RATE_SERVICE] }],
                optionalServices: [HeartRateService.BATTERY_SERVICE],
            });

            this.device.addEventListener('gattserverdisconnected', this.onDisconnected);

            this.updateStatus('Connecting to Heart Rate Monitor...');
            this.server = await this.device.gatt!.connect();

            this.updateStatus('Getting Heart Rate Service...');
            const heartRateService = await this.server.getPrimaryService(HeartRateService.HEART_RATE_SERVICE);

            this.updateStatus('Getting Heart Rate Characteristic...');
            this.heartRateCharacteristic = await heartRateService.getCharacteristic(HeartRateService.HEART_RATE_MEASUREMENT);

            this.updateStatus('Starting Heart Rate Notifications...');
            await this.heartRateCharacteristic.startNotifications();
            this.heartRateCharacteristic.addEventListener('characteristicvaluechanged', this.handleHeartRateNotifications.bind(this));

            // Try to get battery service (optional)
            try {
                const batteryService = await this.server.getPrimaryService(HeartRateService.BATTERY_SERVICE);
                this.batteryCharacteristic = await batteryService.getCharacteristic(HeartRateService.BATTERY_LEVEL);
                await this.batteryCharacteristic.startNotifications();
                this.batteryCharacteristic.addEventListener('characteristicvaluechanged', this.handleBatteryNotifications.bind(this));

                // Read initial battery level
                const batteryValue = await this.batteryCharacteristic.readValue();
                const batteryLevel = batteryValue.getUint8(0);
                console.log('HR Monitor Battery Level:', batteryLevel + '%');
            } catch (error) {
                console.log('Battery service not available on this heart rate monitor');
            }

            this.updateStatus('Connected');
        } catch (error) {
            console.error('Heart Rate Monitor connection failed', error);
            this.updateStatus('Connection failed: ' + error);
        }
    }

    disconnect() {
        if (this.device && this.device.gatt?.connected) {
            this.device.gatt.disconnect();
        }
    }

    private onDisconnected = () => {
        this.updateStatus('Disconnected');
    };

    private updateStatus(status: string) {
        if (this.onStatusCallback) {
            this.onStatusCallback(status);
        }
    }

    private handleHeartRateNotifications(event: Event) {
        const value = (event.target as BluetoothRemoteGATTCharacteristic).value;
        if (!value) return;
        const data = this.parseHeartRate(value);
        if (this.onDataCallback) {
            this.onDataCallback(data);
        }
    }

    private handleBatteryNotifications(event: Event) {
        const value = (event.target as BluetoothRemoteGATTCharacteristic).value;
        if (!value) return;
        const batteryLevel = value.getUint8(0);
        console.log('HR Monitor Battery Level:', batteryLevel + '%');
        // Update the last heart rate data with battery level
        // This will be included in the next heart rate update
    }

    private parseHeartRate(value: DataView): HeartRateData {
        const flags = value.getUint8(0);
        const rate16Bits = flags & 0x1;
        const result: HeartRateData = { heartRate: 0, contactDetected: true };
        let index = 1;

        // Parse heart rate value (8-bit or 16-bit)
        if (rate16Bits) {
            result.heartRate = value.getUint16(index, true);
            index += 2;
        } else {
            result.heartRate = value.getUint8(index);
            index += 1;
        }

        // Parse contact detection
        const contactDetected = flags & 0x2;
        const contactSensorPresent = flags & 0x4;
        if (contactSensorPresent) {
            result.contactDetected = !!contactDetected;
        }

        // Parse energy expended (optional)
        const energyPresent = flags & 0x8;
        if (energyPresent) {
            result.energyExpended = value.getUint16(index, true);
            index += 2;
        }

        // Parse RR intervals (optional)
        const rrIntervalPresent = flags & 0x10;
        if (rrIntervalPresent) {
            const rrIntervals = [];
            for (; index + 1 < value.byteLength; index += 2) {
                rrIntervals.push(value.getUint16(index, true));
            }
            result.rrIntervals = rrIntervals;
        }

        return result;
    }
}
