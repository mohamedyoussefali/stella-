function doGet() {
  let pageTitle = 'Loka Store';
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('StoreData');
    if (sheet) {
      const val = sheet.getRange(2, 15).getDisplayValue();
      if (val) pageTitle = val;
    }
  } catch (e) {
    console.error('Error fetching title in doGet:', e);
  }

  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle(pageTitle)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes')
    .setFaviconUrl('https://www.gstatic.com/images/branding/product/1x/apps_script_48dp.png');
}

// جلب بيانات المحل من Google Sheets
function getStoreData() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) throw new Error('لا يمكن الوصول إلى جدول البيانات. يرجى التأكد من ربط المشروع بجدول بيانات.');

    let sheet = ss.getSheetByName('StoreData');
    
    // إذا لم تكن الورقة موجودة، قم بإنشائها تلقائياً
    if (!sheet) {
      const setupResult = setupSheet();
      if (!setupResult.success) throw new Error('فشل إنشاء ورقة البيانات: ' + setupResult.message);
      sheet = ss.getSheetByName('StoreData');
    }
    
    // التأكد من وجود 16 عموداً كحد أدنى في الشيت لتجنب أخطاء النطاق
    if (sheet.getMaxColumns() < 16) {
      sheet.insertColumnsAfter(sheet.getMaxColumns(), 16 - sheet.getMaxColumns());
    }
    
    // قراءة البيانات من الصف الثاني
    const range = sheet.getRange(2, 1, 1, 16);
    const data = range.getDisplayValues()[0] || [];
    console.log('Data retrieved from sheet, columns:', data.length);
    
    // عداد الزوار باستخدام PropertiesService
    let count = 0;
    try {
      const props = PropertiesService.getScriptProperties();
      count = parseInt(props.getProperty('visitor_count') || '0');
      count++;
      props.setProperty('visitor_count', count.toString());
    } catch (e) {
      console.warn('فشل تحديث عداد الزوار:', e.toString());
    }
    
    return {
      success: true,
      data: {
        storeName: String(data[0] || 'محل الملابس'),
        storeDescription: String(data[1] || 'أفضل محل لبيع الملابس العصرية'),
        logoUrl: String(data[2] || ''),
        phone: String(data[3] || ''),
        whatsapp: String(data[4] || ''),
        phone2: String(data[5] || ''),
        address: String(data[6] || ''),
        facebookUrl: String(data[7] || ''),
        instagramUrl: String(data[8] || ''),
        telegramUrl: String(data[9] || ''),
        workingHours: String(data[10] || 'السبت - الخميس: 9 صباحاً - 10 مساءً'),
        mapUrl: String(data[11] || ''),
        qrCodeUrl: String(data[12] || ''),
        occasion: String(data[13] || ''),
        pageTitle: String(data[14] || 'Loka Store | معلومات الاتصال'),
        footerText: String(data[15] || '© 2024 Loka Store - صنع بكل حب لخدمة عملائنا'),
        visitorCount: count
      }
    };
  } catch (error) {
    Logger.log('Error in getStoreData: ' + error.stack);
    return {
      success: false,
      message: error.toString()
    };
  }
}

// تحديث بيانات المحل
function updateStoreData(storeData) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (!ss) throw new Error('لا يمكن الوصول إلى جدول البيانات.');

    const sheet = ss.getSheetByName('StoreData');
    if (!sheet) {
      return {
        success: false,
        message: 'لم يتم العثور على ورقة StoreData'
      };
    }
    
    // تحديث البيانات في الصف الثاني
    sheet.getRange(2, 1, 1, 14).setValues([[
      storeData.storeName || '',
      storeData.storeDescription || '',
      storeData.logoUrl || '',
      storeData.phone || '',
      storeData.whatsapp || '',
      storeData.phone2 || '',
      storeData.address || '',
      storeData.facebookUrl || '',
      storeData.instagramUrl || '',
      storeData.telegramUrl || '',
      storeData.workingHours || '',
      storeData.mapUrl || '',
      storeData.qrCodeUrl || '',
      storeData.occasion || '',
      storeData.pageTitle || '',
      storeData.footerText || ''
    ]]);
    
    return {
      success: true,
      message: 'تم تحديث البيانات بنجاح'
    };
  } catch (error) {
    Logger.log('Error in updateStoreData: ' + error.toString());
    return {
      success: false,
      message: error.toString()
    };
  }
}

// إنشاء ورقة البيانات إذا لم تكن موجودة
function setupSheet() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName('StoreData');
    
    // إذا كانت الورقة موجودة بالفعل، لا تفعل شيء
    if (sheet) {
      return {
        success: true,
        message: 'ورقة StoreData موجودة بالفعل'
      };
    }
    
    // إنشاء ورقة جديدة
    sheet = ss.insertSheet('StoreData');
    
    // إضافة العناوين
    const headers = [
      'اسم المحل',
      'وصف المحل',
      'رابط اللوجو',
      'رقم الهاتف',
      'رقم الواتساب',
      'رقم الجوال الثاني',
      'العنوان',
      'رابط فيسبوك',
      'رابط انستجرام',
      'رابط تليجرام',
      'ساعات العمل',
      'رابط الخريطة',
      'رابط QR Code',
      'Occasion',
      'العنوان في المتصفح',
      'نص التذييل'
    ];
    
    // تنسيق صف العناوين
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setValues([headers]);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#667eea');
    headerRange.setFontColor('#ffffff');
    headerRange.setHorizontalAlignment('center');
    headerRange.setVerticalAlignment('middle');
    
    // إضافة بيانات تجريبية
    const sampleData = [
      'بوتيك الأناقة',
      'أفضل محل لبيع الملابس العصرية والأزياء الراقية بأسعار مناسبة',
      'https://via.placeholder.com/200x200/667eea/ffffff?text=Logo',
      '+20 123 456 7890',
      '+20 987 654 3210',
      'شارع التحرير، القاهرة، مصر',
      'https://facebook.com/yourboutique',
      'https://instagram.com/yourboutique',
      'https://t.me/yourboutique',
      'السبت - الخميس: 9 صباحاً - 10 مساءً | الجمعة: 2 ظهراً - 10 مساءً',
      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3453.1234567890!2d31.2357!3d30.0444!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzDCsDAyJzM5LjgiTiAzMcKwMTQnMDguNSJF!5e0!3m2!1sen!2seg!4v1234567890',
      'https://wa.me/201234567890',
      '',
      'Loka Store | معلومات الاتصال',
      '© 2024 Loka Store - صنع بكل حب لخدمة عملائنا'
    ];
    
    sheet.getRange(2, 1, 1, sampleData.length).setValues([sampleData]);
    
    // تنسيق الأعمدة
    sheet.autoResizeColumns(1, headers.length);
    sheet.setFrozenRows(1); // تجميد صف العناوين
    
    // إضافة حدود للجدول
    const dataRange = sheet.getRange(1, 1, 2, headers.length);
    dataRange.setBorder(true, true, true, true, true, true);
    
    return {
      success: true,
      message: 'تم إنشاء ورقة StoreData بنجاح مع بيانات تجريبية'
    };
    
  } catch (error) {
    return {
      success: false,
      message: 'حدث خطأ في إنشاء الورقة: ' + error.toString()
    };
  }
}

// دالة اختبار - قم بتشغيلها للتأكد من أن كل شيء يعمل
function testGetData() {
  const result = getStoreData();
  Logger.log(result);
  return result;
}
