import {DataTypes, fn} from 'sequelize';
import ditokokuSequelize from '../connections/ditokoku-sequelize';

const RegionProvinces = ditokokuSequelize.define('RegionProvinces', {
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
    }
}, {
    tableName: 'region_provinces',
    timestamps: false,
    indexes: [
        {
            name: 'idx_region_provinces_id',
            unique: true,
            fields: [{
                attribute: 'id',
                order: 'ASC'
            }]
        },
        {
            name: 'idx_region_provinces_name',
            unique: false,
            fields: [{
                attribute: 'name',
                order: 'ASC'
            }]
        }
    ]
});

export { RegionProvinces as default}
