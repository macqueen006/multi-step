import type { IStaticMethods } from "preline/dist";
import $ from 'jquery';
import _ from 'lodash';
import noUiSlider from 'nouislider';
import * as VanillaCalendarPro from 'vanilla-calendar-pro';
import 'datatables.net';

declare global {
  interface Window {
    // Optional third-party libraries
    _: typeof _;
    $: typeof $;
    jQuery: typeof $;
    DataTable: typeof $.fn.dataTable;
    noUiSlider: typeof noUiSlider;
    Dropzone: unknown;
    VanillaCalendarPro: typeof VanillaCalendarPro;
    
    // Preline UI
    HSStaticMethods: IStaticMethods;
  }
}

export {};