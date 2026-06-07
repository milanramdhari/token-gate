import { prisma } from "db";

export abstract class ModelService {
  static async getModels() {
    const models = await prisma.model.findMany();
    const mappings = await prisma.modelProviderMapping.findMany({
      where: { modelId: { in: models.map((model) => model.id) } },
      include: { provider: true },
    });
    const mappingsByModelId = new Map<number, typeof mappings>();
    for (const mapping of mappings) {
      const list = mappingsByModelId.get(mapping.modelId) ?? [];
      list.push(mapping);
      mappingsByModelId.set(mapping.modelId, list);
    }

    const companies = await prisma.company.findMany({
      where: {
        id: { in: models.map((model) => model.companyId) },
      },
    });
    const companyById = new Map(companies.map((company) => [company.id, company]));

    return models.flatMap((model) => {
      const company = companyById.get(model.companyId);
      if (!company) return [];
      const modelMappings = mappingsByModelId.get(model.id) ?? [];

      return [
        {
          id: model.id.toString(),
          name: model.name,
          slug: model.slug,
          company: {
            id: company.id.toString(),
            name: company.name,
            website: company.website,
          },
          providers: modelMappings.map((mapping) => ({
            id: mapping.provider.id.toString(),
            name: mapping.provider.name,
            website: mapping.provider.website,
            inputTokenCost: mapping.inputTokenCost,
            outputTokenCost: mapping.outputTokenCost,
          })),
        },
      ];
    });
  }

  static async getModelProviders(modelId: number) {
    const model = await prisma.model.findUnique({
      where: { id: modelId },
    });

    if (!model) return null;

    const mappings = await prisma.modelProviderMapping.findMany({
      where: { modelId },
      include: { provider: true },
    });

    return mappings.map((mapping) => ({
      id: mapping.provider.id.toString(),
      name: mapping.provider.name,
      website: mapping.provider.website,
      inputTokenCost: mapping.inputTokenCost,
      outputTokenCost: mapping.outputTokenCost,
    }));
  }

  static async getProviders() {
    const providers = await prisma.provider.findMany({
      include: {
        modelProviderMappings: true,
      },
    });

    const modelIds = [
      ...new Set(
        providers.flatMap((provider) =>
          provider.modelProviderMappings.map((mapping) => mapping.modelId),
        ),
      ),
    ];
    const models = await prisma.model.findMany({
      where: { id: { in: modelIds } },
    });
    const modelById = new Map(models.map((model) => [model.id, model]));

    return providers.map((provider) => ({
      id: provider.id.toString(),
      name: provider.name,
      website: provider.website,
      models: provider.modelProviderMappings.flatMap((mapping) => {
        const model = modelById.get(mapping.modelId);
        if (!model) return [];
        return [{ id: model.id.toString(), name: model.name, slug: model.slug }];
      }),
    }));
  }
}
