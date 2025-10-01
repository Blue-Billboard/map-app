import { createApp } from 'vue'
import App from './App.vue'
import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';
import './styles/index.css'

import Dialog from 'primevue/dialog';
import Steps from 'primevue/steps';
import Card from 'primevue/card';
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";
import Checkbox from "primevue/checkbox";
import Dropdown from "primevue/dropdown";
import Select from "primevue/select";
import Avatar from "primevue/avatar";
import Popover from 'primevue/popover';
import InputText from "primevue/inputtext";
import Drawer from "primevue/drawer";
import Toast from 'primevue/toast';
import Accordion from 'primevue/accordion';
import AccordionPanel from 'primevue/accordionpanel';
import DataView from 'primevue/dataview';
import TabMenu from 'primevue/tabmenu';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import Fieldset from 'primevue/fieldset';

import ToastService from 'primevue/toastservice';

const app = createApp(App);
app.use(PrimeVue, {
    theme: {
        preset: Aura,
        options: {
            cssLayer: {
                name: 'primevue',
                order: 'theme, base, primevue'
            }
        }
    }
});

app.component('Dialog', Dialog);
app.component('Steps', Steps);
app.component('Card', Card);
app.component('DataTable', DataTable);
app.component('Column', Column);
app.component('Button', Button);
app.component('Checkbox', Checkbox);
app.component('Dropdown', Dropdown);
app.component('Select', Select);
app.component('Avatar', Avatar);
app.component('Popover', Popover);
app.component('InputText', InputText);
app.component('Toast', Toast);
app.component('Drawer', Drawer);
app.component('DataView', DataView);
app.component('Accordion', Accordion);
app.component('AccordionPanel', AccordionPanel);
app.component('TabMenu', TabMenu);
app.component('TabView', TabView);
app.component('TabPanel', TabPanel);
app.component('Fieldset', Fieldset);

app.use(ToastService);

app.mount('#mapApp');
