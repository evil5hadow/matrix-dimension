import { Model, Sequelize } from "sequelize-typescript";
import config from "../config";
import { LogService } from "matrix-js-snippets";
import User from "./models/User";
import UserScalarToken from "./models/UserScalarToken";
import Upstream from "./models/Upstream";
import * as Promise from "bluebird";

class _DimensionStore {
    private sequelize: Sequelize;

    constructor() {
        this.sequelize = new Sequelize({
            dialect: 'sqlite',
            database: "dimension",
            storage: config.database.file,
            username: "",
            password: "",
            logging: i => LogService.verbose("DimensionStore [SQL]", i)
        });
        this.sequelize.addModels(<Array<typeof Model>>[
            User,
            UserScalarToken,
            Upstream,
        ]);
    }

    public updateSchema(): Promise<any> {
        LogService.info("DimensionStore", "Updating schema...");
        return this.sequelize.sync();
    }

    public doesUserHaveTokensForAllUpstreams(userId: string): Promise<boolean> {
        let upstreamTokenIds: number[] = [];
        let hasDimensionToken = false;
        return UserScalarToken.findAll({where: {userId: userId}}).then(results => {
            upstreamTokenIds = results.filter(t => !t.isDimensionToken).map(t => t.upstreamId);
            hasDimensionToken = results.filter(t => t.isDimensionToken).length >= 1;
            return Upstream.findAll();
        }).then(upstreams => {
            if (!hasDimensionToken) {
                LogService.warn("DimensionStore", "User " + userId + " is missing a Dimension scalar token");
                return false;
            }

            for (const upstream of upstreams) {
                if (upstreamTokenIds.indexOf(upstream.id) === -1) {
                    LogService.warn("DimensionStore", "User " + userId + " is missing a scalar token for upstream " + upstream.id + " (" + upstream.name + ")");
                    return false;
                }
            }

            return true;
        });
    }

    public getTokenOwner(scalarToken: string): Promise<User> {
        let user: User = null;
        return UserScalarToken.findAll({where: {isDimensionToken: true, scalarToken: scalarToken}, include: [User]}).then(tokens => {
            if (!tokens || tokens.length === 0) {
                return Promise.reject("Invalid token");
            }

            user = tokens[0].user;
            return this.doesUserHaveTokensForAllUpstreams(user.userId);
        }).then(hasUpstreams => {
            if (!hasUpstreams) {
                return Promise.reject("Invalid token"); // missing one or more upstreams == no validation
            }
            return Promise.resolve(user);
        });
    }
}

export const DimensionStore = new _DimensionStore();