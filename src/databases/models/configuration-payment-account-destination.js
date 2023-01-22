import {DataTypes, fn} from 'sequelize';
import ditokokuSequelize from '../connections/ditokoku-sequelize';

const ConfigurationPaymentAccountDestinations = ditokokuSequelize.define('ConfigurationPaymentAccountDestinations', {
    // Model attributes are defined here
    id: {
        type: DataTypes.INTEGER,
        allowNull:false,
        primaryKey: true,
        autoIncrement: true
    },
    number: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    bank_name: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    holder_name: {
        type: DataTypes.STRING(200),
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
    tableName: 'configuration_payment_account_destinations',
    timestamps: false,
    indexes: [
        {
            name: 'idx_configuration_payment_account_destinations_id',
            unique: true,
            fields: [{
                attribute: 'id',
                order: 'ASC'
            }]
        },
        {
            name: 'idx_configuration_payment_account_destinations_deleted_datetime',
            unique: false,
            fields: [{
                attribute: 'deleted_datetime',
                order: 'ASC'
            }]
        }
    ]
});

export { ConfigurationPaymentAccountDestinations as default}
