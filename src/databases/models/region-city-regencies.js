import {DataTypes, fn} from 'sequelize';
import ditokokuSequelize from '../connections/ditokoku-sequelize';

const RegionCityRegencies = ditokokuSequelize.define('RegionCityRegencies', {
    // Model attributes are defined here
    id: {
        type: DataTypes.INTEGER,
        allowNull:false,
        primaryKey: true,
        autoIncrement: true
    },
    province_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING(50),
        allowNull: false
    }
}, {
    tableName: 'region_city_regencies',
    timestamps: false,
    indexes: [
        {
            name: 'idx_region_city_regencies_id',
            unique: true,
            fields: [{
                attribute: 'id',
                order: 'ASC'
            }]
        },
        {
            name: 'idx_region_city_regencies_name',
            unique: false,
            fields: [{
                attribute: 'name',
                order: 'ASC'
            }]
        },
        {
            name: 'idx_region_city_regencies_province_id',
            unique: false,
            fields: [{
                attribute: 'province_id',
                order: 'ASC'
            }]
        }
    ]
});

export { RegionCityRegencies as default}
