import ditokokuSequelize from './connections/ditokoku-sequelize';
import Resellers from './models/resellers';
import Genders from './models/genders';
import ConfigurationBalanceBonus from './models/configuration-balance-bonus';
import ResellerBalances from './models/reseller-balances';
import ResellerBalanceTypes from './models/reseller-balance-types';
import Banners from './models/banners';
import Admins from './models/admins';
import CategoryProducts from './models/category-products';

const databaseSynchronize = async()=> {
    try {
        try {
            await ditokokuSequelize.authenticate();

            Resellers.belongsTo(Genders, {foreignKey: 'gender_id', targetKey: 'id'});
            ResellerBalances.belongsTo(Resellers, {foreignKey: 'reseller_id', targetKey: 'id'});
            ResellerBalances.belongsTo(ResellerBalanceTypes, {foreignKey: 'reseller_balance_type_id', targetKey: 'id'});
            
            await Genders.sync({ alter:true });
            console.log('genders synchronize successfully.');

            await Resellers.sync({ alter:true });
            console.log('resellers synchronize successfully.');

            await ConfigurationBalanceBonus.sync({ alter:true });
            console.log('configuration_balance_bonus synchronize successfully.');

            await ResellerBalanceTypes.sync({ alter:true });
            console.log('reselller_balance_types synchronize successfully.');

            await ResellerBalances.sync({ alter:true });
            console.log('reselller_balances synchronize successfully.');

            await Banners.sync({ alter:true });
            console.log('banners synchronize successfully.');

            await Admins.sync({ alter:true });
            console.log('admins synchronize successfully.');

            await CategoryProducts.sync({ alter:true });
            console.log('category_products synchronize successfully.');

        } catch (error) {
            console.error('database synchronization failed: ', error);
        }
    } catch (error) {
        console.log(error.message)
    }
}

module.exports  = databaseSynchronize;

