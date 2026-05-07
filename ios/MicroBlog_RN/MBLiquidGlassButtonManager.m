//
//  MBLiquidGlassButtonManager.m
//  MicroBlog_RN
//

#import <React/RCTViewManager.h>

#import "MBLiquidGlassButton.h"

@interface MBLiquidGlassButtonManager : RCTViewManager

@end

@implementation MBLiquidGlassButtonManager

RCT_EXPORT_MODULE(MBLiquidGlassButton)

RCT_EXPORT_VIEW_PROPERTY(title, NSString)
RCT_EXPORT_VIEW_PROPERTY(systemImageName, NSString)
RCT_EXPORT_VIEW_PROPERTY(variant, NSString)
RCT_EXPORT_VIEW_PROPERTY(buttonAccessibilityLabel, NSString)
RCT_EXPORT_VIEW_PROPERTY(foregroundColor, UIColor)
RCT_EXPORT_VIEW_PROPERTY(baseBackgroundColor, UIColor)
RCT_EXPORT_VIEW_PROPERTY(onPress, RCTBubblingEventBlock)

- (UIView *) view
{
  return [[MBLiquidGlassButton alloc] init];
}

@end
