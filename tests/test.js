import { DevicesPage } from '../pages/page';
import { getDevices } from '../support/api';

const UI_URL = 'http://localhost:3001';

fixture('Device Management Tests').page(UI_URL);

const devicesPage = new DevicesPage();

// Test: Validate that all devices from the API are correctly displayed in the UI
test('Verify devices from API are displayed correctly in the UI', async (t) => {
  // Step 1: Fetch device data from the API
  const devices = await getDevices();

  // Step 2: Iterate through each device and validate its properties in the UI
  for (let device of devices) {
    const deviceElement = devicesPage.getDeviceByName(device.system_name);
    const capacityText = await devicesPage.getDeviceCapacity(device.system_name)
      .textContent;
    const capacityNumber = capacityText.replace(' GB', ''); // Convert capacity text for comparison

    await t
      // Validate device presence and match its properties
      .expect(deviceElement.exists)
      .ok(`Device ${device.system_name} should be displayed in the UI`)
      .expect(devicesPage.getDeviceType(device.system_name).textContent)
      .eql(
        device.type,
        `Device type for ${device.system_name} should match API data`
      )
      .expect(capacityNumber)
      .eql(
        device.hdd_capacity.toString(),
        `HDD capacity for ${device.system_name} should match API data`
      )
      // Validate edit and delete buttons for each device
      .expect(devicesPage.getDeviceEditButton(device.system_name).exists)
      .ok('Edit button should be available for each device')
      .expect(devicesPage.getDeviceRemoveButton(device.system_name).exists)
      .ok('Delete button should be available for each device');
  }
});

// Test: Add a new device and confirm it appears correctly in the list
test('Add a new device and verify its display in the UI', async (t) => {
  const newDevice = {
    system_name: 'TEST-DEVICE',
    type: 'MAC',
    hdd_capacity: '256',
  };

  // Step 1: Use the UI form to create a new device
  await t
    .click(devicesPage.addDeviceButton)
    .typeText(devicesPage.systemNameInput, newDevice.system_name)
    .click(devicesPage.deviceTypeSelect)
    .click(devicesPage.deviceTypeSelect.find('option').withText(newDevice.type))
    .typeText(devicesPage.capacityInput, newDevice.hdd_capacity)
    .click(devicesPage.saveButton);

  // Step 2: Validate the newly created device is correctly displayed in the UI
  const newDeviceElement = devicesPage.getDeviceByName(newDevice.system_name);

  await t
    .expect(newDeviceElement.exists)
    .ok(`Device ${newDevice.system_name} should appear in the list`)
    .expect(devicesPage.getDeviceType(newDevice.system_name).textContent)
    .eql(newDevice.type, `Type for ${newDevice.system_name} should match`)
    .expect(devicesPage.getDeviceCapacity(newDevice.system_name).textContent)
    .eql(
      `${newDevice.hdd_capacity} GB`,
      `HDD capacity for ${newDevice.system_name} should match`
    );
});

// Test: Edit an existing device and validate that the changes are reflected in the UI
test('Edit a device and verify the updated details are displayed in the UI', async (t) => {
  const deviceToEdit = 'TEST-DEVICE'; // Device to be edited
  const updatedDevice = {
    system_name: 'EDITED-DEVICE',
    type: 'MAC',
    hdd_capacity: '512',
  };

  // Step 1: Update device details using the UI form
  await t
    .click(devicesPage.getDeviceEditButton(deviceToEdit))
    .selectText(devicesPage.systemNameInput)
    .pressKey('delete')
    .typeText(devicesPage.systemNameInput, updatedDevice.system_name)
    .click(devicesPage.deviceTypeSelect)
    .click(
      devicesPage.deviceTypeSelect.find('option').withText(updatedDevice.type)
    )
    .selectText(devicesPage.capacityInput)
    .pressKey('delete')
    .typeText(devicesPage.capacityInput, updatedDevice.hdd_capacity)
    .click(devicesPage.saveButton);

  // Step 2: Validate the updated device details in the UI
  const updatedDeviceElement = devicesPage.getDeviceByName(
    updatedDevice.system_name
  );

  await t
    .expect(updatedDeviceElement.exists)
    .ok(`Updated device ${updatedDevice.system_name} should appear in the list`)
    .expect(devicesPage.getDeviceType(updatedDevice.system_name).textContent)
    .eql(
      updatedDevice.type,
      `Type for ${updatedDevice.system_name} should match`
    )
    .expect(
      devicesPage.getDeviceCapacity(updatedDevice.system_name).textContent
    )
    .eql(
      `${updatedDevice.hdd_capacity} GB`,
      `HDD capacity for ${updatedDevice.system_name} should match`
    );
});

// Test: Delete a device and verify it is removed from the UI and the API
test('Delete a device and verify it is removed from the system', async (t) => {
  const devices = await getDevices();
  if (devices.length === 0) throw new Error('No devices found to delete.');

  const deviceToDelete = devices[0].system_name; // Select the first device for deletion

  // Step 1: Refresh the page to ensure UI sync with backend
  await t.eval(() => location.reload(true));

  // Step 2: Validate the device exists in the UI before deletion
  const deviceElement = devicesPage.getDeviceByName(deviceToDelete);
  await t
    .expect(deviceElement.exists)
    .ok(`Device ${deviceToDelete} should be displayed before deletion`)
    .click(devicesPage.getDeviceRemoveButton(deviceToDelete))
    .expect(deviceElement.exists)
    .notOk(`Device ${deviceToDelete} should be removed from the UI`);

  // Step 3: Validate the device no longer exists in the API
  const updatedDevices = await getDevices();
  await t
    .expect(
      updatedDevices.some((device) => device.system_name === deviceToDelete)
    )
    .notOk(`Device ${deviceToDelete} should no longer exist in the API`);
});
