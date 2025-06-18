module.exports = {
    meta: {
        type: "problem",
        severity: "warn",
        docs: {
            description: "Detect link nodes that cross tabs"
        },
        options: {
            crossTabLinks: { type: "boolean", default: true }
        }
    },
    create: function(context, ruleConfig) {
        const crossTabLinksEnabled = ruleConfig?.crossTabLinks !== false;

        if (!crossTabLinksEnabled) {
            return {}; // Rule is disabled, no-op
        }

        let linkInNodes = [];
        let linkOutNodes = [];
        let tabs = [];
        let tabLabels = {};

        return {
            "start": function(flow) {
                linkInNodes = flow.filter(n => n.type === "link in");
                linkOutNodes = flow.filter(n => n.type === "link out");
                tabs = flow.filter(n => n.type === "tab");
                tabLabels = Object.fromEntries(tabs.map(tab => [tab.id, tab.label]));
            },
            "node": function(node) {
                if (node.type === "link out" && Array.isArray(node.links)) {
                    node.links.forEach(linkId => {
                        const targetNode = linkInNodes.find(inNode => inNode.id === linkId);
                        if (targetNode && node.z !== targetNode.z) {
                            context.report({
                                location: [node.id],
                                message: `Cross-tab link from '${node.name || node.id}' (tab: '${tabLabels[node.z] || node.z}') to '${targetNode.name || targetNode.id}' (tab: '${tabLabels[targetNode.z] || targetNode.z}')`
                            });
                        }
                    });
                }
            }
        };
    }
};
