export class File {
    constructor(provider) {
        this.provider = provider;
    }
    async create(file, metadata) {
        return this.provider.create(file, metadata);
    }
    async update(id, file, metadata) {
        return this.provider.update(id, file, metadata);
    }
    async destroy(id) {
        return this.provider.destroy(id);
    }
    async find(query) {
        return this.provider.find(query);
    }
    async findById(id) {
        return this.provider.findById(id);
    }
    async getFileStream(id, variant) {
        return this.provider.getFileStream(id, variant);
    }
}
//# sourceMappingURL=file.js.map