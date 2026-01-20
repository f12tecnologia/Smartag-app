import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';

Font.register({
  family: 'Helvetica-Bold',
  src: `https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf`,
});
Font.register({
  family: 'Helvetica',
  src: `https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf`,
});


const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 11,
    paddingTop: 30,
    paddingLeft: 40,
    paddingRight: 40,
    paddingBottom: 30,
    backgroundColor: '#ffffff'
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    color: '#333333',
    fontFamily: 'Helvetica-Bold'
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 10,
    color: '#555555',
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
    paddingBottom: 4,
  },
  summaryText: {
    fontSize: 12,
    lineHeight: 1.5,
    marginBottom: 10,
    color: '#444444'
  },
  statContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statBox: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 5,
    padding: 15,
    textAlign: 'center',
    width: '30%'
  },
  statValue: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: '#222222',
  },
  statLabel: {
    fontSize: 10,
    color: '#666666'
  },
  table: {
    display: "table",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: "row"
  },
  tableColHeader: {
    width: "70%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#f8f8f8',
    padding: 5,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  tableCol: {
    width: "70%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 5,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
   tableHeader: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 10,
  },
  tableCell: {
    fontSize: 9,
  },
  footer: {
    position: 'absolute',
    fontSize: 9,
    bottom: 15,
    left: 40,
    right: 40,
    textAlign: 'center',
    color: 'grey',
  },
});

const ReportPDF = ({ data }) => {
  const { totalUrls, totalClicks, avgClicks, topUrls, period, filterTitle } = data;
  const generationDate = new Date().toLocaleDateString('pt-BR');

  const filterText = filterTitle ? ` a URL "${filterTitle}"` : "todas as URLs";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>Relatório de Performance de QR Codes</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumo Executivo</Text>
          <Text style={styles.summaryText}>
            Este relatório apresenta uma análise de performance dos QR Codes gerenciados na plataforma, 
            considerando o período de {period}. A análise abrange {filterText}.
          </Text>
        </View>

        <View style={styles.statContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{totalUrls}</Text>
            <Text style={styles.statLabel}>Total de URLs</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{totalClicks}</Text>
            <Text style={styles.statLabel}>Total de Cliques</Text>
          </View>
           <View style={styles.statBox}>
            <Text style={styles.statValue}>{avgClicks}</Text>
            <Text style={styles.statLabel}>Média de Cliques/URL</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>URLs com Mais Cliques</Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <View style={styles.tableColHeader}>
                <Text style={styles.tableHeader}>Título da URL</Text>
              </View>
              <View style={{...styles.tableColHeader, width: '30%'}}>
                <Text style={styles.tableHeader}>Cliques</Text>
              </View>
            </View>
            {topUrls.map((url, i) => (
              <View style={styles.tableRow} key={i}>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>{url.name || 'Sem título'}</Text>
                </View>
                <View style={{...styles.tableCol, width: '30%'}}>
                  <Text style={styles.tableCell}>{url.clicks}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
        
        <Text style={styles.footer}>Relatório gerado em {generationDate}.</Text>
      </Page>
    </Document>
  );
};

export default ReportPDF;