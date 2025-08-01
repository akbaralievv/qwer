/* eslint-disable */
import PropTypes from 'prop-types';
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer';

import gerb from '../../../assets/gerb.png';

import PTSerifItalic from '../../../../fonts/PTSerif-Italic.ttf';
import PTSerifBoldItalic from '../../../../fonts/PTSerif-BoldItalic.ttf';
import PTSerifBold from '../../../../fonts/PTSerif-Bold.ttf';
import { convertToRuFormat } from 'src/utils/convernRuFormat';

Font.register({
  family: 'PTSerif',
  fonts: [
    { src: PTSerifItalic, fontStyle: 'italic', fontWeight: 'normal' },
    { src: PTSerifBoldItalic, fontStyle: 'italic', fontWeight: 'bold' },
    { src: PTSerifBold, fontStyle: 'normal', fontWeight: 'bold' },
  ],
});

const styles = StyleSheet.create({
  page: {
    paddingTop: 35,
    paddingBottom: 65,
    paddingHorizontal: 25,
  },
  title: {
    margin: '10px 0 0 30',
    fontSize: 14,
    textAlign: 'center',
    fontFamily: 'PTSerif',
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 15,
  },
  subtitle: {
    fontSize: 12,
    textAlign: 'center',
    fontFamily: 'PTSerif',
    fontWeight: 'bold',
    maxWidth: 250,
  },
  image: {
    paddingLeft: 25,
    width: 100,
    height: 75,
  },
  content: {
    marginTop: 20,
    padding: 10,
  },
  section: {
    marginBottom: 10,
  },
  hr: {
    marginTop: 15,
    width: '100%',
    height: 1,
    backgroundColor: '#000000',
  },
  block: {
    height: 4,
    width: 1400,
    backgroundColor: 'red',
  },
  headerText: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  miniTitle: {
    fontSize: 12,
    fontFamily: 'PTSerif',
    fontWeight: 'normal',
  },
  middleTitle: {
    fontSize: 14,
    fontFamily: 'PTSerif',
    fontWeight: 'normal',
  },
  blockREctor: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerRight: {
    paddingRight: 25,
  },
});
const MediaComponent = () => (
  <View>
    <View style={[styles.hr, { backgroundColor: 'black' }]} />
  </View>
);

const PDFFile = ({ formData = {}, objectPDF = {}, name = '', positions = {} }) => {
  return (
    <Document>
      <Page style={styles.page} size="A4" orientation="portrait">
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, { marginLeft: 13 }]}>КЫРГЫЗ РЕСПУБЛИКАСЫ</Text>
            <Text style={styles.subtitle}>Кыргыз медико-стоматологиялык институту</Text>
          </View>
          <Image style={styles.image} src={gerb || '/path/to/default/gerb.png'} />
          <View style={styles.headerRight}>
            <Text style={styles.title}>КЫРГЫЗСКАЯ РЕСПУБЛИКА</Text>
            <Text style={styles.subtitle}>Кыргызский медико-стоматологический институт</Text>
          </View>
        </View>
        <MediaComponent />
        <View style={styles.content}>
          <Text style={[styles.title, { marginTop: 25, marginBottom: 13 }]}>
            БУЙРУК – ПРИКАЗ № {formData?.docNumber || '___'}
          </Text>
          <View style={styles.header}>
            <Text style={styles.miniTitle}>г.Кара-Балта</Text>
            <Text style={styles.miniTitle}>{convertToRuFormat(formData?.docDate) || '___'}</Text>
          </View>
          <Text style={[styles.miniTitle, { marginTop: 15 }]}>«О зачислении абитуриентов»</Text>
          <Text style={[styles.miniTitle, { marginTop: 18 }]}>
            В соответствии с Правилами приема на обучение по образовательным программам высшего
            образования в Кыргызский медико-стоматологический институт на{' '}
            {formData?.academicYear || '___'}.
          </Text>
          <Text style={styles.miniTitle}>Основание: {formData?.basedOn || '___'}</Text>
          <Text style={[styles.middleTitle, { margin: '10 0 8 0' }]}>ПРИКАЗЫВАЮ:</Text>
          <Text style={styles.miniTitle}>
            Зачислить с {convertToRuFormat(formData?.periodFrom) || '___'} по{' '}
            {convertToRuFormat(formData?.periodTo) || '___'} в число студентов{' '}
            {objectPDF?.course || '___'}
            очной формы обучения по направлениям:
          </Text>
          <Text style={[styles.miniTitle, { marginTop: 5 }]}>
            1.1 {objectPDF?.facultative || '___'}
          </Text>
          <Text style={[styles.miniTitle, { marginTop: 5 }]}>{name || '___'}</Text>
          <Text style={styles.miniTitle}>Сумма: {formData?.contract || '___'} сом</Text>
        </View>
        <View style={styles.content}>
          <View style={styles.blockREctor}>
            <Text style={styles.miniTitle}>Ректор КМСИ</Text>
            <Text style={styles.miniTitle}>{positions?.rector || '___'}</Text>
          </View>
          <View style={[styles.blockREctor, { margin: '13 0 15 0' }]}>
            <Text style={styles.miniTitle}>
              Согласовано
              {'\n'} фин. директор
            </Text>
            <Text style={styles.miniTitle}>{positions?.director || '___'}</Text>
          </View>
          <Text style={styles.miniTitle}>
            Разослать: _______________________________________________________________________
          </Text>
          <Text style={styles.miniTitle}>ОК.Бухгалтерия.Уч.часть.</Text>
        </View>
      </Page>
    </Document>
  );
};

PDFFile.propTypes = {
  formData: PropTypes.shape({
    docNumber: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    docDate: PropTypes.string.isRequired,
    academicYear: PropTypes.string,
    basedOn: PropTypes.string.isRequired,
    periodFrom: PropTypes.string.isRequired,
    periodTo: PropTypes.string.isRequired,
    amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }),
  objectPDF: PropTypes.shape({
    course: PropTypes.string.isRequired,
    facultative: PropTypes.string.isRequired,
  }).isRequired,
};
export default PDFFile;
