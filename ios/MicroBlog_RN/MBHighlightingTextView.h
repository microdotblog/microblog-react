//
//  MBHighlightingTextView.h
//  MicroBlog_RN
//
//  Created by Manton Reece on 4/16/23.
//

#import <UIKit/UIKit.h>
#import <React/RCTViewManager.h>

NS_ASSUME_NONNULL_BEGIN

@interface MBHighlightingTextView : UITextView

@property (copy, nonatomic) RCTBubblingEventBlock onChangeText;
@property (copy, nonatomic) RCTBubblingEventBlock onSelectionChange;
@property (strong, nonatomic) UIView* reactAccessoryView;
@property (assign, nonatomic) CGFloat keyboardHeight;

- (void) callTextChanged:(NSString *)text;
- (void) callSelectionChanged:(UITextRange *)range;

- (void) adjustHeight;

@end

NS_ASSUME_NONNULL_END
