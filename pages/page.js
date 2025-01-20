import { Selector } from 'testcafe';

export class DevicesPage {
  constructor() {
    this.deviceMainBox = Selector('.device-main-box');
    this.addDeviceButton = Selector('.submitButton');
    this.systemNameInput = Selector('#system_name');
    this.deviceTypeSelect = Selector('#type');
    this.capacityInput = Selector('#hdd_capacity');
    this.saveButton = Selector('.submitButton');
  }

  getDeviceByName(name) {
    return this.deviceMainBox.find('.device-name').withExactText(name);
  }

  getDeviceEditButton(name) {
    return this.getDeviceByName(name)
      .parent('.device-main-box')
      .find('.device-edit');
  }

  getDeviceRemoveButton(name) {
    return this.getDeviceByName(name)
      .parent('.device-main-box')
      .find('.device-remove');
  }

  getDeviceCapacity(name) {
    return this.getDeviceByName(name).sibling('.device-capacity');
  }

  getDeviceType(name) {
    return this.getDeviceByName(name).sibling('.device-type');
  }
}
