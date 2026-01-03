/// <reference types="web-bluetooth" />

export interface RowingData {
    strokeRate?: number;
    strokeCount?: number;
    averageStrokeRate?: number;
    totalDistance?: number;
    instantaneousPace?: number;
    averagePace?: number;
    instantaneousPower?: number;
    averagePower?: number;
    resistanceLevel?: number;
    totalEnergy?: number;
    energyPerHour?: number;
    energyPerMinute?: number;
    heartRate?: number;
    elapsedTime?: number; // Seconds
    remainingTime?: number; // Seconds
}

export class BluetoothService {
    private device: BluetoothDevice | null = null;
    private server: BluetoothRemoteGATTServer | null = null;
    private characteristic: BluetoothRemoteGATTCharacteristic | null = null;
    private onDataCallback: ((data: RowingData) => void) | null = null;
    private onStatusCallback: ((status: string) => void) | null = null;

    // UUIDs
    private static FTMS_SERVICE = 0x1826;
    private static ROWER_DATA_CHARACTERISTIC = 0x2ad1;

    constructor() { }

    async connect(onData: (data: RowingData) => void, onStatus: (status: string) => void) {
        this.onDataCallback = onData;
        this.onStatusCallback = onStatus;

        try {
            this.updateStatus('Requesting Bluetooth Device...');
            this.device = await navigator.bluetooth.requestDevice({
                filters: [{ services: [BluetoothService.FTMS_SERVICE] }],
            });

            this.device.addEventListener('gattserverdisconnected', this.onDisconnected);

            this.updateStatus('Connecting to GATT Server...');
            this.server = await this.device.gatt!.connect();

            this.updateStatus('Getting Service...');
            const service = await this.server.getPrimaryService(BluetoothService.FTMS_SERVICE);

            this.updateStatus('Getting Characteristic...');
            this.characteristic = await service.getCharacteristic(BluetoothService.ROWER_DATA_CHARACTERISTIC);

            this.updateStatus('Starting Notifications...');
            await this.characteristic.startNotifications();
            this.characteristic.addEventListener('characteristicvaluechanged', this.handleNotifications.bind(this));

            this.updateStatus('Connected');
        } catch (error) {
            console.error('Connection failed', error);
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

    private handleNotifications(event: Event) {
        const value = (event.target as BluetoothRemoteGATTCharacteristic).value;
        if (!value) return;
        const data = this.parseRowerData(value);
        if (this.onDataCallback) {
            this.onDataCallback(data);
        }
    }


    private parseRowerData(value: DataView): RowingData {
        const data: RowingData = {};
        const flags = value.getUint16(0, true);
        let byteIndex = 2;

        // Bit 0: Stroke Rate and Stroke Count (present when bit is 0)
        if ((flags & (1 << 0)) === 0) {
            let rawRate = value.getUint8(byteIndex);
            if (rawRate === 0xFF) rawRate = 0;
            data.strokeRate = rawRate / 2;  // Convert back from 0.5 SPM resolution
            byteIndex += 1;
            data.strokeCount = value.getUint16(byteIndex, true);
            byteIndex += 2;
        }

        // Bit 1: Average Stroke Rate
        if ((flags & (1 << 1)) !== 0) {
            data.averageStrokeRate = value.getUint8(byteIndex);
            byteIndex += 1;
        }

        // Bit 2: Total Distance
        if ((flags & (1 << 2)) !== 0) {
            // uint24
            const low = value.getUint16(byteIndex, true);
            const high = value.getUint8(byteIndex + 2);
            data.totalDistance = low + (high << 16);
            byteIndex += 3;
        }

        // Bit 3: Instantaneous Pace
        if ((flags & (1 << 3)) !== 0) {
            data.instantaneousPace = value.getUint16(byteIndex, true);
            if (data.instantaneousPace === 0xFFFF) data.instantaneousPace = undefined;
            byteIndex += 2;
        }

        // Bit 4: Average Pace
        if ((flags & (1 << 4)) !== 0) {
            data.averagePace = value.getUint16(byteIndex, true);
            byteIndex += 2;
        }

        // Bit 5: Instantaneous Power
        if ((flags & (1 << 5)) !== 0) {
            data.instantaneousPower = value.getInt16(byteIndex, true);
            byteIndex += 2;
        }

        // Bit 6: Average Power
        if ((flags & (1 << 6)) !== 0) {
            data.averagePower = value.getInt16(byteIndex, true);
            byteIndex += 2;
        }

        // Bit 7: Resistance Level
        if ((flags & (1 << 7)) !== 0) {
            data.resistanceLevel = value.getUint8(byteIndex);
            byteIndex += 1;
        }

        // Bit 8: Total Energy and Per Hour/Minute
        if ((flags & (1 << 8)) !== 0) {
            data.totalEnergy = value.getUint16(byteIndex, true);
            byteIndex += 2;
            data.energyPerHour = value.getUint16(byteIndex, true);
            byteIndex += 2;
            data.energyPerMinute = value.getUint8(byteIndex);
            byteIndex += 1;
        }

        // Bit 9: Heart Rate
        if ((flags & (1 << 9)) !== 0) {
            data.heartRate = value.getUint8(byteIndex);
            byteIndex += 1;
        }

        // Bit 10: Metabolic Equivalent
        if ((flags & (1 << 10)) !== 0) {
            // data.metabolicEquivalent = value.getUint8(byteIndex);
            byteIndex += 1;
        }

        // Bit 11: Elapsed Time
        if ((flags & (1 << 11)) !== 0) {
            data.elapsedTime = value.getUint16(byteIndex, true);
            byteIndex += 2;
        }

        // Bit 12: Remaining Time
        if ((flags & (1 << 12)) !== 0) {
            data.remainingTime = value.getUint16(byteIndex, true);
            byteIndex += 2;
        }

        return data;
    }
}
