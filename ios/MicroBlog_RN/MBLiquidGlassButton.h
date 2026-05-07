//
//  MBLiquidGlassButton.h
//  MicroBlog_RN
//

#import <UIKit/UIKit.h>
#import <React/RCTComponent.h>

NS_ASSUME_NONNULL_BEGIN

@interface MBLiquidGlassButton : UIView

@property (copy, nonatomic, nullable) NSString* title;
@property (copy, nonatomic, nullable) NSString* systemImageName;
@property (copy, nonatomic, nullable) NSString* variant;
@property (copy, nonatomic, nullable) NSString* buttonAccessibilityLabel;
@property (strong, nonatomic, nullable) UIColor* foregroundColor;
@property (strong, nonatomic, nullable) UIColor* baseBackgroundColor;
@property (copy, nonatomic) RCTBubblingEventBlock onPress;

@end

NS_ASSUME_NONNULL_END
