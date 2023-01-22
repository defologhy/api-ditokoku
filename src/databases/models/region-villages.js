import {DataTypes, fn} from 'sequelize';
import ditokokuSequelize from '../connections/ditokoku-sequelize';

const RegionVillages = ditokokuSequelize.define('RegionVillages', {
    // Model attributes are defined here
    id: {
        type: DataTypes.INTEGER,
        allowNull:false,
        primaryKey: true,
        autoIncrement: true
    },
    district_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    city_regency_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    zip_code: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    postal_code: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
}, {
    tableName: 'region_villages',
    timestamps: false,
    indexes: [
        {
            name: 'idx_region_villages_id',
            unique: true,
            fields: [{
                attribute: 'id',
                order: 'ASC'
            }]
        },
        {
            name: 'idx_region_villages_name',
            unique: false,
            fields: [{
                attribute: 'name',
                order: 'ASC'
            }]
        },
        {
            name: 'idx_region_villages_district_id',
            unique: false,
            fields: [{
                attribute: 'district_id',
                order: 'ASC'
            }]
        },
        {
            name: 'idx_region_villages_city_regency_id',
            unique: false,
            fields: [{
                attribute: 'city_regency_id',
                order: 'ASC'
            }]
        },
        {
            name: 'idx_region_villages_postal_code',
            unique: false,
            fields: [{
                attribute: 'postal_code',
                order: 'ASC'
            }]
        }
    ]
});

export { RegionVillages as default}
