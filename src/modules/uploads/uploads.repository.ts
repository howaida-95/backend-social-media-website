import type { CreationAttributes } from 'sequelize';
import Upload from '@modules/uploads/uploads.model';

const uploadsRepository = {
  create: (attributes: CreationAttributes<Upload>) => Upload.create(attributes),
};

export default uploadsRepository;
