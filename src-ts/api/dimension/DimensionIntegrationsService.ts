import { GET, Path, PathParam, QueryParam } from "typescript-rest";
import * as Promise from "bluebird";
import { ScalarService } from "../scalar/ScalarService";
import { DimensionStore } from "../../db/DimensionStore";
import { DimensionAdminService } from "./DimensionAdminService";
import { Widget } from "../../integrations/Widget";
import { MemoryCache } from "../../MemoryCache";

interface IntegrationsResponse {
    widgets: Widget[],
}

@Path("/api/v1/dimension/integrations")
export class DimensionIntegrationsService {

    private static integrationCache = new MemoryCache();

    public static clearIntegrationCache() {
        DimensionIntegrationsService.integrationCache.clear();
    }

    @GET
    @Path("enabled")
    public getEnabledIntegrations(@QueryParam("scalar_token") scalarToken: string): Promise<IntegrationsResponse> {
        return ScalarService.getTokenOwner(scalarToken).then(_userId => {
            return this.getIntegrations(true);
        }, ScalarService.invalidTokenErrorHandler);
    }

    @GET
    @Path("all")
    public getAllIntegrations(@QueryParam("scalar_token") scalarToken: string): Promise<IntegrationsResponse> {
        return DimensionAdminService.validateAndGetAdminTokenOwner(scalarToken).then(_userId => {
            return this.getIntegrations(null);
        });
    }

    @GET
    @Path("room/:roomId")
    public getIntegrationsInRoom(@QueryParam("scalar_token") scalarToken: string, @PathParam("roomId") roomId: string) :Promise<IntegrationsResponse>{
        console.log(roomId);
        return this.getEnabledIntegrations(scalarToken);
    }

    private getIntegrations(isEnabledCheck?: boolean): Promise<IntegrationsResponse> {
        const cachedResponse = DimensionIntegrationsService.integrationCache.get("integrations_" + isEnabledCheck);
        if (cachedResponse) {
            return cachedResponse;
        }
        const response = <IntegrationsResponse>{
            widgets: [],
        };
        return Promise.resolve()
            .then(() => DimensionStore.getWidgets(isEnabledCheck))
            .then(widgets => response.widgets = widgets)

            // Cache and return response
            .then(() => DimensionIntegrationsService.integrationCache.put("integrations_" + isEnabledCheck, response))
            .then(() => response);
    }
}