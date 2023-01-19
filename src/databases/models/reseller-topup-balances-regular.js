import {DataTypes, fn} from 'sequelize';
import ditokokuSequelize from '../connections/ditokoku-sequelize';

const ResellerTopupBalancesRegular = ditokokuSequelize.define('ResellerTopupBalancesRegular', {
    // Model attributes are defined here
    id: {
        type: DataTypes.INTEGER,
        allowNull:false,
        primaryKey: true,
        autoIncrement: true
    },
    amount: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    reseller_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    progress_status_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    payment_account_id: {
        type: DataTypes.INTEGER,
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
    tableName: 'reseller_topup_balances_regular',
    timestamps: false,
    indexes: [
        {
            name: 'idx_reseller_topup_balances_regular_id',
            unique: true,
            fields: [{
                attribute: 'id',
                order: 'ASC'
            }]
        },
        {
            name: 'idx_reseller_topup_balances_regular_reseller_id',
            unique: false,
            fields: [{
                attribute: 'reseller_id',
                order: 'ASC'
            }]
        },
        {
            name: 'idx_reseller_topup_balances_regular_progress_status_id',
            unique: false,
            fields: [{
                attribute: 'progress_status_id',
                order: 'ASC'
            }]
        },
        {
            name: 'idx_reseller_topup_balances_regular_payment_account_id',
            unique: false,
            fields: [{
                attribute: 'payment_account_id',
                order: 'ASC'
            }]
        },
        {
            name: 'idx_reseller_topup_balances_regular_deleted_datetime',
            unique: false,
            fields: [{
                attribute: 'deleted_datetime',
                order: 'ASC'
            }]
        }
    ]
});

export { ResellerTopupBalancesRegular as default}
