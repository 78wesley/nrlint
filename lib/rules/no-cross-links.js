function findCrossTabLinks(flowSet) {
    const linkIns = new Map();
    const linkOuts = [];
    const tabLabel = new Map();

    flowSet.flows.forEach((tab) => {
        tabLabel.set(tab.id, (tab.config && tab.config.label) || "");
    });

    flowSet.nodes.forEach((n) => {
        if (n.type === "link in") linkIns.set(n.id, n);
        if (n.type === "link out") linkOuts.push(n);
    });

    const results = [];

    for (const out of linkOuts) {
        const targets = (out.outboundWires || []).flat();

        for (const wire of targets) {
            const destNode = wire.destinationNode;
            if (!destNode) continue;
            const inn = linkIns.get(destNode.id);
            if (inn) {
                if (out.z !== inn.z) {
                    results.push({
                        from: out.id,
                        fromName: out.config.name || "",
                        fromTab: out.z,
                        fromTabLabel: tabLabel.get(out.z) || "",
                        to: inn.id,
                        toName: inn.config.name || "",
                        toTab: inn.z,
                        toTabLabel: tabLabel.get(inn.z) || "",
                    });
                }
            }
        }
    }
    return results;
}

module.exports = {
    meta: {
        type: "problem",
        severity: "warn",
        docs: { description: "Detect link nodes that cross tabs" },
    },

    create(context) {
        return {
            start(flowSet) {
                const crossTab = findCrossTabLinks(flowSet);
                crossTab.forEach((link) => {
                    context.report({
                        location: [link.to, link.from],
                        message: `Cross tab link node found, between flow "${link.toTabLabel}" and flow "${link.fromTabLabel}"`,
                    });
                });
            },
        };
    },
};
