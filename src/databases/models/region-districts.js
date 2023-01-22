import {DataTypes, fn} from 'sequelize';
import ditokokuSequelize from '../connections/ditokoku-sequelize';

const RegionDistricts = ditokokuSequelize.define('RegionDistricts', {
    // Model attributes are defined here
    id: {
        type: DataTypes.INTEGER,
        allowNull:false,
        primaryKey: true,
        autoIncrement: true
    },
    city_regency_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING(50),
        allowNull: false
    }
}, {
    tableName: 'region_districts',
    timestamps: false,
    indexes: [
        {
            name: 'idx_region_districts_id',
            unique: true,
            fields: [{
                attribute: 'id',
                order: 'ASC'
            }]
        },
        {
            name: 'idx_region_districts_name',
            unique: false,
            fields: [{
                attribute: 'name',
                order: 'ASC'
            }]
        },
        {
            name: 'idx_region_districts_city_regency_id',
            unique: false,
            fields: [{
                attribute: 'city_regency_id',
                order: 'ASC'
            }]
        }
    ]
});

export { RegionDistricts as default}
