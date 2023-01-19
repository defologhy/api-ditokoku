import {DataTypes, fn} from 'sequelize';
import ditokokuSequelize from '../connections/ditokoku-sequelize';

const ResellerTopupBalancesRegularProgressStatus = ditokokuSequelize.define('ResellerTopupBalancesRegularProgressStatus', {
    // Model attributes are defined here
    id: {
        type: DataTypes.INTEGER,
        allowNull:false,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    created_datetime: {
        type: DataTypes.DATE(3),
        allowNull: false,
        // defaultValue: fn('NOW')
    },
    created_user_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    last_updated_datetime: {
        type: DataTypes.DATE(3),
        allowNull: false,
        // defaultValue: fn('NOW')
    },
    last_updated_user_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    deleted_datetime: {
        type: DataTypes.DATE(3),
        allowNull: true
    },
    deleted_user_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
}, {
    tableName: 'reseller_topup_balances_regular_progress_status',
    timestamps: false,
    indexes: [
        {
            name: 'idx_reseller_topup_balances_regular_progress_status_id',
            unique: true,
            fields: [{
                attribute: 'id',
                order: 'ASC'
            }]
        },
        {
            name: 'idx_reseller_topup_balances_regular_progress_status_name',
            unique: false,
            fields: [{
                attribute: 'name',
                order: 'ASC'
            }]
        },
        {
            name: 'idx_genders_deleted_datetime',
            unique: false,
            fields: [{
                attribute: 'deleted_datetime',
                order: 'ASC'
            }]
        }
    ]
});

export { ResellerTopupBalancesRegularProgressStatus as default}
