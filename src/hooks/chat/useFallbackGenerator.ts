
export const useFallbackGenerator = () => {
  const generateEnhancedFallback = (query: string, similarRecords: any[]) => {
    const recordAnalysis = similarRecords.map((record, index) => {
      const excerpt = record.cleaned_text.substring(0, 500);
      const hasDischarge = excerpt.toLowerCase().includes('discharge') || 
                          excerpt.toLowerCase().includes('medication') ||
                          excerpt.toLowerCase().includes('prescribed');
      
      return {
        ...record,
        index: index + 1,
        excerpt,
        relevanceNote: hasDischarge ? 'Contains discharge/medication information' : 'General clinical context'
      };
    });

    return `# Clinical Records Analysis

## Query: ${query}

### Executive Summary
Found **${similarRecords.length} relevant clinical records** with similarity scores ranging from **${(similarRecords[similarRecords.length - 1]?.similarity_score * 100).toFixed(1)}%** to **${(similarRecords[0]?.similarity_score * 100).toFixed(1)}%**.

### Detailed Clinical Records

${recordAnalysis.map(record => `
#### Record ${record.index} - ${record.relevanceNote}
- **Patient ID**: ${record.subject_id}
- **Admission ID**: ${record.hadm_id} 
- **Date**: ${record.charttime}
- **Similarity Score**: ${(record.similarity_score * 100).toFixed(1)}%

**Clinical Content**:
${record.excerpt}${record.cleaned_text.length > 500 ? '\n\n*[Content truncated - full record available in source]*' : ''}

---
`).join('')}

### Clinical Insights & Recommendations

**Pattern Analysis**: The retrieved records show semantic similarity to your query about "${query}". Each record represents a clinical encounter that may contain relevant information.

**Next Steps**: 
1. Review each record's full content for specific details
2. Cross-reference admission IDs for complete care episodes
3. Consider temporal relationships between records

**Technical Note**: *This analysis was generated using vector similarity search. For enhanced clinical interpretation with natural language processing, ensure Ollama LLM service is running.*

---
*Analysis generated on ${new Date().toLocaleString()}*`;
  };

  return {
    generateEnhancedFallback
  };
};
