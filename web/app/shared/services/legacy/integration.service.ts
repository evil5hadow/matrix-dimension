import { Injectable } from "@angular/core";
import { LegacyIntegration } from "../../models/legacyintegration";
import { RssConfigComponent } from "../../../configs-old/rss/rss-config.component";
import { ContainerContent } from "ngx-modialog";
import { IrcConfigComponent } from "../../../configs-old/irc/irc-config.component";
import { TravisCiConfigComponent } from "../../../configs-old/travisci/travisci-config.component";
import { CustomWidgetConfigComponent } from "../../../configs-old/widget/custom_widget/custom_widget-config.component";
import { YoutubeWidgetConfigComponent } from "../../../configs-old/widget/youtube/youtube-config.component";
import { TwitchWidgetConfigComponent } from "../../../configs-old/widget/twitch/twitch-config.component";
import { EtherpadWidgetConfigComponent } from "../../../configs-old/widget/etherpad/etherpad-config.component";
import { JitsiWidgetConfigComponent } from "../../../configs-old/widget/jitsi/jitsi-config.component";
import {
    WIDGET_CUSTOM, WIDGET_ETHERPAD, WIDGET_GOOGLE_CALENDAR, WIDGET_GOOGLE_DOCS, WIDGET_JITSI, WIDGET_TWITCH,
    WIDGET_YOUTUBE
} from "../../models/widget";
import { GoogleDocsWidgetConfigComponent } from "../../../configs-old/widget/googledocs/googledocs-config.component";
import { GoogleCalendarWidgetConfigComponent } from "../../../configs-old/widget/googlecalendar/googlecalendar-config.component";
import { CircleCiConfigComponent } from "../../../configs-old/circleci/circleci-config.component";

@Injectable()
export class LegacyIntegrationService {

    private static supportedIntegrationsMap = {
        "bot": {}, // empty == supported
        "complex-bot": {
            "rss": {
                component: RssConfigComponent,
            },
            "travisci": {
                component: TravisCiConfigComponent,
            },
            "circleci": {
                component: CircleCiConfigComponent,
            },
        },
        "bridge": {
            "irc": {
                component: IrcConfigComponent,
            },
        },
        "widget": {
            "customwidget": {
                component: CustomWidgetConfigComponent,
                types: WIDGET_CUSTOM,
            },
            "youtube": {
                component: YoutubeWidgetConfigComponent,
                types: WIDGET_YOUTUBE
            },
            "etherpad": {
                component: EtherpadWidgetConfigComponent,
                types: WIDGET_ETHERPAD,
            },
            "twitch": {
                component: TwitchWidgetConfigComponent,
                types: WIDGET_TWITCH,
            },
            "jitsi": {
                component: JitsiWidgetConfigComponent,
                types: WIDGET_JITSI,
            },
            "googledocs": {
                component: GoogleDocsWidgetConfigComponent,
                types: WIDGET_GOOGLE_DOCS,
            },
            "googlecalendar": {
                component: GoogleCalendarWidgetConfigComponent,
                types: WIDGET_GOOGLE_CALENDAR,
            },
        },
    };

    static getAllConfigComponents(): ContainerContent[] {
        const components = [];

        for (const iType of Object.keys(LegacyIntegrationService.supportedIntegrationsMap)) {
            for (const iiType of Object.keys(LegacyIntegrationService.supportedIntegrationsMap[iType])) {
                const component = LegacyIntegrationService.supportedIntegrationsMap[iType][iiType].component;
                if (component) components.push(component);
            }
        }

        return components;
    }

    static isSupported(integration: LegacyIntegration): boolean {
        const forType = LegacyIntegrationService.supportedIntegrationsMap[integration.type];
        if (!forType) return false;

        if (Object.keys(forType).length === 0) return true;

        return forType[integration.integrationType]; // has sub type
    }

    static hasConfig(integration: LegacyIntegration): boolean {
        return integration.type !== "bot";
    }

    static getConfigComponent(integration: LegacyIntegration): ContainerContent {
        return LegacyIntegrationService.supportedIntegrationsMap[integration.type][integration.integrationType].component;
    }

    static getIntegrationForScreen(screen: string): { type: string, integrationType: string } {
        for (const iType of Object.keys(LegacyIntegrationService.supportedIntegrationsMap)) {
            for (const iiType of Object.keys(LegacyIntegrationService.supportedIntegrationsMap[iType])) {
                const integrationTypes = LegacyIntegrationService.supportedIntegrationsMap[iType][iiType].types;
                const integrationScreens = integrationTypes.map(t => "type_" + t);
                if (integrationScreens.includes(screen)) return {type: iType, integrationType: iiType};
            }
        }

        return null;
    }

    constructor() {
    }
}