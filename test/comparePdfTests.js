const comparePdf = require("../index");
const chai = require("chai");
const expect = chai.expect;

describe("Compare Pdf Common Tests", () => {
    it("Should be able to override default configs", async () => {
        let config = require("../config");
        let comparisonResults = await new comparePdf(config)
            .actualPdfFile("newSame.pdf")
            .baselinePdfFile("baseline.pdf")
            .compare();
        expect(comparisonResults.status).to.equal("passed");
    });

    it("Should be able to override specific config property", async () => {
        const ComparePdf = new comparePdf();
        ComparePdf.config.paths.actualPdfRootFolder = process.cwd() + "/data/newActualPdfs";
        let comparisonResults = await ComparePdf.actualPdfFile("newSame.pdf")
            .baselinePdfFile("baseline.pdf")
            .compare();
        expect(comparisonResults.status).to.equal("passed");
    });

    it("Should be able to throw error when passing invalid actual pdf file path", async () => {
        let comparisonResults = await new comparePdf()
            .actualPdfFile("missing.pdf")
            .baselinePdfFile("baseline.pdf")
            .compare();
        expect(comparisonResults.status).to.equal("failed");
        expect(comparisonResults.message).to.equal(
            "Actual pdf file path does not exists. Please define correctly then try again."
        );
    });

    it("Should be able to throw error when not passing actual pdf file path", async () => {
        let comparisonResults = await new comparePdf()
            .actualPdfFile("")
            .baselinePdfFile("baseline.pdf")
            .compare();
        expect(comparisonResults.status).to.equal("failed");
        expect(comparisonResults.message).to.equal(
            "Actual pdf file path was not set. Please define correctly then try again."
        );
    });

    it("Should be able to throw error when passing invalid baseline pdf file path", async () => {
        let comparisonResults = await new comparePdf()
            .actualPdfFile("same.pdf")
            .baselinePdfFile("missing.pdf")
            .compare();
        expect(comparisonResults.status).to.equal("failed");
        expect(comparisonResults.message).to.equal(
            "Baseline pdf file path does not exists. Please define correctly then try again."
        );
    });

    it("Should be able to throw error when not passing baseline pdf file path", async () => {
        let comparisonResults = await new comparePdf()
            .actualPdfFile("same.pdf")
            .baselinePdfFile("")
            .compare();
        expect(comparisonResults.status).to.equal("failed");
        expect(comparisonResults.message).to.equal(
            "Baseline pdf file path was not set. Please define correctly then try again."
        );
    });

    it("Should be able to verify PDFs byBase64 and when it fails then byImage", async () => {
        let comparisonResultsByBase64 = await new comparePdf()
            .actualPdfFile("notSame.pdf")
            .baselinePdfFile("baseline.pdf")
            .compare("byBase64");
        expect(comparisonResultsByBase64.status).to.equal("failed");
        expect(comparisonResultsByBase64.message).to.equal(
            "notSame.pdf is not the same as baseline.pdf compared by their base64 values."
        );

        if (comparisonResultsByBase64.status === "failed") {
            let comparisonResultsByImage = await new comparePdf()
                .actualPdfFile("notSame.pdf")
                .baselinePdfFile("baseline.pdf")
                .compare("byImage");
            expect(comparisonResultsByImage.status).to.equal("failed");
            expect(comparisonResultsByImage.message).to.equal(
                "notSame.pdf is not the same as baseline.pdf compared by their images."
            );
            expect(comparisonResultsByImage.details).to.not.be.null;
        }
    });
});

describe("Compare Pdf By Image Tests", () => {
    it("Should be able to verify same PDFs", async () => {
        let comparisonResults = await new comparePdf()
            .actualPdfFile("same.pdf")
            .baselinePdfFile("baseline.pdf")
            .compare();
        expect(comparisonResults.status).to.equal("passed");
    });

    it("Should be able to verify same PDFs without extension", async () => {
        let comparisonResults = await new comparePdf()
            .actualPdfFile("same")
            .baselinePdfFile("baseline")
            .compare();
        expect(comparisonResults.status).to.equal("passed");
    });

    it("Should be able to verify same PDFs using relative paths", async () => {
        let comparisonResults = await new comparePdf()
            .actualPdfFile("../data/actualPdfs/same.pdf")
            .baselinePdfFile("../data/baselinePdfs/baseline.pdf")
            .compare();
        expect(comparisonResults.status).to.equal("passed");
    });

    it("Should be able to verify different PDFs", async () => {
        const ComparePdf = new comparePdf();
        let comparisonResults = await ComparePdf.actualPdfFile("notSame.pdf")
            .baselinePdfFile("baseline.pdf")
            .compare();
        expect(comparisonResults.status).to.equal("failed");
        expect(comparisonResults.message).to.equal(
            "notSame.pdf is not the same as baseline.pdf compared by their images."
        );
        expect(comparisonResults.details).to.not.be.null;
    });

    it("Should be able to verify same PDFs with Masks", async () => {
        let comparisonResults = await new comparePdf()
            .actualPdfFile("maskedSame.pdf")
            .baselinePdfFile("baseline.pdf")
            .addMask(1, { x0: 35, y0: 70, x1: 145, y1: 95 })
            .addMask(1, { x0: 185, y0: 70, x1: 285, y1: 95 })
            .compare();
        expect(comparisonResults.status).to.equal("passed");
    });

    it("Should be able to verify different PDFs with Masks", async () => {
        const ComparePdf = new comparePdf();
        let masks = [
            { pageIndex: 1, coordinates: { x0: 35, y0: 70, x1: 145, y1: 95 } },
            { pageIndex: 1, coordinates: { x0: 185, y0: 70, x1: 285, y1: 95 } }
        ];
        let comparisonResults = await ComparePdf.actualPdfFile("maskedNotSame.pdf")
            .baselinePdfFile("baseline.pdf")
            .addMasks(masks)
            .compare();
        expect(comparisonResults.status).to.equal("failed");
        expect(comparisonResults.message).to.equal(
            "maskedNotSame.pdf is not the same as baseline.pdf compared by their images."
        );
        expect(comparisonResults.details).to.not.be.null;
    });

    it("Should be able to verify same PDFs with Croppings", async () => {
        let comparisonResults = await new comparePdf()
            .actualPdfFile("same.pdf")
            .baselinePdfFile("baseline.pdf")
            .cropPage(1, { width: 530, height: 210, x: 0, y: 415 })
            .compare();
        expect(comparisonResults.status).to.equal("passed");
    });

    it("Should be able to verify same PDFs with Multiple Croppings", async () => {
        let croppings = [
            { pageIndex: 0, coordinates: { width: 210, height: 180, x: 615, y: 770 } },
            { pageIndex: 1, coordinates: { width: 530, height: 210, x: 0, y: 415 } }
        ];

        let comparisonResults = await new comparePdf()
            .actualPdfFile("same.pdf")
            .baselinePdfFile("baseline.pdf")
            .cropPages(croppings)
            .compare();
        expect(comparisonResults.status).to.equal("passed");
    });

    it("Should be able to verify only specific page indexes", async () => {
        let comparisonResults = await new comparePdf()
            .actualPdfFile("notSame.pdf")
            .baselinePdfFile("baseline.pdf")
            .onlyPageIndexes([1])
            .compare();
        expect(comparisonResults.status).to.equal("passed");
    });

    it("Should be able to skip specific page indexes", async () => {
        let comparisonResults = await new comparePdf()
            .actualPdfFile("notSame.pdf")
            .baselinePdfFile("baseline.pdf")
            .skipPageIndexes([0])
            .compare();
        expect(comparisonResults.status).to.equal("passed");
    });
});

describe("Compare Pdf By Base64 Tests", () => {
    it("Should be able to verify same PDFs", async () => {
        let comparisonResults = await new comparePdf()
            .actualPdfFile("same.pdf")
            .baselinePdfFile("baseline.pdf")
            .compare("byBase64");
        expect(comparisonResults.status).to.equal("passed");
    });

    it("Should be able to verify different PDFs", async () => {
        let comparisonResults = await new comparePdf()
            .actualPdfFile("notSame.pdf")
            .baselinePdfFile("baseline.pdf")
            .compare("byBase64");
        expect(comparisonResults.status).to.equal("failed");
        expect(comparisonResults.message).to.equal(
            "notSame.pdf is not the same as baseline.pdf compared by their base64 values."
        );
    });
});
